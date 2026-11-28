import { useLayoutEffect, useRef } from "react";

// Shrinks any [data-fit] line until its text fits on one line, so long BUSY
// item names / invoice numbers never get cut off on the 100 x 50 mm label.
function fitLines(root) {
  root.querySelectorAll("[data-fit]").forEach((el) => {
    el.style.fontSize = "";
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth && size > 7) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  });
}

/** One 100 mm x 50 mm box label. Values are printed exactly as uploaded. */
export default function BoxLabel({ label, offsetX = 0, offsetY = 0 }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current) fitLines(ref.current);
  }, [label]);

  return (
    <div className="lbl" ref={ref}>
      <div
        className="lbl-inner"
        style={{ "--ox": `${offsetX}mm`, "--oy": `${offsetY}mm` }}
      >
        <div className="lbl-line lbl-company" data-fit>
          {label.company}
        </div>
        <div className="lbl-line lbl-item" data-fit>
          {label.item}
        </div>
        <div className="lbl-line lbl-field" data-fit>
          FSN NO- {label.fsn}
        </div>
        <div className="lbl-line lbl-field" data-fit>
          DOCKET No.- {label.docket}
        </div>
        <div className="lbl-line lbl-field" data-fit>
          PO NO. {label.po}
        </div>
        {label.party && (
          <div className="lbl-line lbl-field lbl-party" data-fit>
            PARTY- {label.party}
          </div>
        )}
        {label.transporter && (
          <div className="lbl-line lbl-field" data-fit>
            TRANSPORTER- {label.transporter}
          </div>
        )}
        <div className="lbl-bottom">
          <span className="lbl-line lbl-invoice" data-fit>
            INVOICE NO- {label.bill}
          </span>
          <span className="lbl-box">
            BOX {label.boxNo}/{label.boxTotal}
          </span>
        </div>
      </div>
    </div>
  );
}
