import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';

export default function TaskColumn({ columnId, title, hint, dotColor, tasks, parseMeta, onRemove }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor }} />
        <span style={{ fontSize: 13.5, fontWeight: 800, color: INK }}>{title}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: INK3, background: 'rgba(21,19,15,0.06)', borderRadius: 20, padding: '1px 8px' }}>{tasks.length}</span>
      </div>
      <p style={{ fontSize: 11, color: INK3, margin: '0 0 10px' }}>{hint}</p>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps}
            style={{
              flex: 1, minHeight: 120, borderRadius: 14, padding: 10,
              background: snapshot.isDraggingOver ? 'rgba(124,58,237,0.06)' : 'rgba(21,19,15,0.025)',
              border: `1.5px dashed ${snapshot.isDraggingOver ? '#7C3AED' : 'rgba(21,19,15,0.08)'}`,
              transition: 'background 0.15s, border-color 0.15s',
            }}>
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <p style={{ fontSize: 12, color: INK3, textAlign: 'center', padding: '24px 8px', margin: 0, fontFamily: F }}>Glisse une carte ici</p>
            )}
            {tasks.map((t, i) => (
              <Draggable key={t.id} draggableId={t.id} index={i}>
                {(prov, snap) => (
                  <TaskCard
                    task={t}
                    meta={parseMeta(t)}
                    innerRef={prov.innerRef}
                    dragProps={prov.draggableProps}
                    dragHandle={prov.dragHandleProps}
                    isDragging={snap.isDragging}
                    onRemove={onRemove}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}