import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Users, Check, X, Home, Save, RefreshCw } from 'lucide-react';
import { getPlansConfig, savePlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { toast } from 'sonner';

export default function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    billing_cycle: 'monthly',
    features: [],
    visible: true,
    credits_limit: 10,
    checkout_url_monthly: '',
    checkout_url_yearly: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allUsers, dbPlans] = await Promise.all([
        base44.entities.User.list(),
        loadPlansFromDB(),
      ]);
      setUsers(allUsers || []);
      // Always use DB as source of truth, clear localStorage stale cache
      const freshPlans = dbPlans || getPlansConfig();
      setPlans(freshPlans);
    } catch (error) {
      toast.error('Error while loading');
      setPlans(getPlansConfig());
    }
  };

  const getSubscriberCount = (planId) => {
    return users.filter(u => u.subscription_plan === planId).length;
  };

  const handleEdit = (plan) => {
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price_monthly: plan.price_monthly || 0,
      price_yearly: plan.price_yearly || 0,
      billing_cycle: plan.billing_cycle || 'monthly',
      features: plan.features || [],
      visible: plan.visible !== false,
      credits_limit: plan.credits_limit || 10,
      checkout_url_monthly: plan.checkout_url_monthly || '',
      checkout_url_yearly: plan.checkout_url_yearly || '',
    });
    setEditingPlanId(plan.id);
    setAddingNew(false);
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      billing_cycle: 'monthly',
      features: [],
      visible: true,
      credits_limit: 10,
      checkout_url_monthly: '',
      checkout_url_yearly: '',
    });
    setEditingPlanId('new');
    setAddingNew(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    const currentPlans = [...plans];
    let updatedPlans;

    if (addingNew) {
      const newPlan = { ...formData, id: `plan_${Date.now()}` };
      updatedPlans = [...currentPlans, newPlan];
    } else {
      updatedPlans = currentPlans.map(p => p.id === editingPlanId ? { ...p, ...formData } : p);
    }

    await savePlansConfig(updatedPlans); // Added await here to prevent silent sync failures
    setPlans(updatedPlans);
    toast.success('Plan saved');
    setEditingPlanId(null);
    setAddingNew(false);
  };

  const handleDelete = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!confirm(`Supprimer définitivement le plan "${plan?.name}" ? Cette action est irréversible.`)) return;
    const updatedPlans = plans.filter(p => p.id !== planId);
    await savePlansConfig(updatedPlans);
    setPlans(updatedPlans);
    toast.success('Plan supprimé définitivement');
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const getPriceDisplay = (plan) => {
    if (plan.price_monthly === 0) return 'Free';
    if (plan.price_monthly >= 999) return 'Custom pricing';
    return `${plan.price_monthly} €/month`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#666666] hover:bg-[#F7F7F8] rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-[20px] font-medium text-[#1A1A1A]">Subscription Plans</h1>
          <span className="text-[12px] text-[#888] bg-[#F5F5F3] px-2 py-0.5 rounded-full">{plans.length} plans</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add a plan
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            subscriberCount={getSubscriberCount(plan.id)}
            onEdit={() => handleEdit(plan)}
            onDelete={() => handleDelete(plan.id)}
            isEditing={editingPlanId === plan.id}
          />
        ))}

        {/* Inline Edit Form - Note: this renders at the bottom of the grid */}
        {editingPlanId && (
          <div className="col-span-full">
            <InlineEditForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={() => {
                setEditingPlanId(null);
                setAddingNew(false);
              }}
              isAddingNew={addingNew}
              addFeature={addFeature}
              removeFeature={removeFeature}
              updateFeature={updateFeature}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, subscriberCount, onEdit, onDelete, isEditing }) {
  const priceDisplay = plan.price_monthly === 0 ? 'Free' : 
                       plan.price_monthly >= 999 ? 'Custom pricing' : 
                       `${plan.price_monthly} €/month`;

  return (
    <div className={`border border-[#E5E5E5] rounded-xl p-6 bg-white transition-all ${isEditing ? 'ring-2 ring-[#1A1A1A]' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-medium text-[#1A1A1A]">{plan.name}</h3>
          <p className="text-[18px] font-semibold text-[#1A1A1A] mt-1">{priceDisplay}</p>
          {plan.price_yearly > 0 && plan.price_monthly > 0 && (
            <p className="text-[12px] text-[#888888] mt-0.5">
              or {plan.price_yearly} €/year
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#F7F7F8] rounded-lg transition-colors"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-[#888888] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer définitivement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {plan.description && (
        <p className="text-[13px] text-[#888888] mb-4 line-clamp-2">{plan.description}</p>
      )}

      {plan.features && plan.features.length > 0 && (
        <ul className="space-y-1.5 mb-4">
          {plan.features.slice(0, 4).map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-[#444444]">
              <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{typeof feature === 'string' ? feature : feature.text || ''}</span>
            </li>
          ))}
          {plan.features.length > 4 && (
            <li className="text-[12px] text-[#888888]">+{plan.features.length - 4} others</li>
          )}
        </ul>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#888888]" />
          <span className="text-[13px] text-[#1A1A1A] font-medium">{subscriberCount} subscriber{subscriberCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

function InlineEditForm({ formData, setFormData, onSave, onCancel, isAddingNew, addFeature, removeFeature, updateFeature }) {
  return (
    <div className="border border-[#E5E5E5] rounded-xl p-6 bg-[#FAFAFA]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-medium text-[#1A1A1A]">
          {isAddingNew ? 'New plan' : 'Edit plan'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-[#888888] hover:bg-[#E5E5E5] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Plan name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            placeholder="E.g., Pro"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            placeholder="Short description"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Monthly price (€)</label>
          <input
            type="number"
            value={formData.price_monthly}
            onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Yearly price (€)</label>
          <input
            type="number"
            value={formData.price_yearly}
            onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Billing cycle</label>
          <select
            value={formData.billing_cycle}
            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
            <option value="none">None</option>
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Credits limit</label>
          <input
            type="number"
            value={formData.credits_limit}
            onChange={(e) => setFormData({ ...formData, credits_limit: Number(e.target.value) })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Checkout URL (monthly)</label>
          <input
            type="url"
            value={formData.checkout_url_monthly}
            onChange={(e) => setFormData({ ...formData, checkout_url_monthly: e.target.value })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            placeholder="https://buy.stripe.com/..."
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#888888] mb-1.5">Checkout URL (yearly)</label>
          <input
            type="url"
            value={formData.checkout_url_yearly}
            onChange={(e) => setFormData({ ...formData, checkout_url_yearly: e.target.value })}
            className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            placeholder="https://buy.stripe.com/..."
          />
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium text-[#888888]">Included features</label>
          <button
            onClick={addFeature}
            type="button"
            className="text-[12px] text-[#1A1A1A] font-medium hover:underline"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1 px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                placeholder="Feature description"
              />
              <button
                onClick={() => removeFeature(index)}
                type="button"
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {formData.features.length === 0 && (
            <p className="text-[12px] text-[#888888] italic">No features added</p>
          )}
        </div>
      </div>

      {/* Visible toggle */}
      <div className="flex items-center justify-between mb-6">
        <label className="text-[13px] font-medium text-[#1A1A1A]">Publicly visible</label>
        <button
          onClick={() => setFormData({ ...formData, visible: !formData.visible })}
          className={`w-12 h-6 rounded-full transition-colors ${formData.visible ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.visible ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-[13px] font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Save
        </button>
      </div>
    </div>
  );
}