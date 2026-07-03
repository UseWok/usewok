import { useEffect, useRef } from 'react';

export default function TrustpilotWidget() {
  const ref = useRef(null);

  useEffect(() => {
    const existing = document.querySelector('script[src*="tp.widget.bootstrap"]');
    const load = () => {
      if (window.Trustpilot && ref.current) window.Trustpilot.loadFromElement(ref.current, true);
    };
    if (existing) {
      load();
    } else {
      const script = document.createElement('script');
      script.src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      script.async = true;
      script.onload = load;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div ref={ref} className="trustpilot-widget" data-locale="en-US" data-template-id="56278e9abfbbba0bdcd568bc"
      data-businessunit-id="6a465d3ffd238b728c3b1373" data-style-height="52px" data-style-width="100%"
      data-token="1f5a34c1-53cc-49a4-8d24-e21944ff5a3c">
      <a href="https://www.trustpilot.com/review/usewok.com" target="_blank" rel="noopener noreferrer">Trustpilot</a>
    </div>
  );
}