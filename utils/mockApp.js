function mockAppHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>AA Form Builder Mock</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; }
      main { display: grid; grid-template-columns: 180px 1fr 260px; gap: 16px; align-items: start; }
      button, select, input, a { margin: 4px; }
      .form-canvas { min-height: 180px; border: 1px solid #999; padding: 12px; }
      .canvas-field-textbox { display: block; width: 220px; margin: 8px 0; padding: 8px; border: 1px solid #bbb; }
      [data-testid="rule-card"] { border: 1px solid #999; margin: 8px 0; padding: 8px; }
      .expanded { display: block; }
      [role="menuitem"] { display: none; }
      [role="menuitem"].visible { display: inline-block; }
    </style>
  </head>
  <body>
    <nav>
      <a href="#automation">Automation</a>
      <button type="button">Create Form</button>
    </nav>
    <main>
      <section>
        <div data-testid="palette-textbox" class="palette-item-textbox">Textbox</div>
      </section>
      <section>
        <div data-testid="form-canvas" class="form-canvas" aria-label="Form canvas"></div>
        <button type="button">Save</button>
        <button role="tab" type="button">Rules</button>
        <section data-testid="rules-list" class="rules-list">
          <button type="button" id="add-rule">Add Rule</button>
          <button type="button" id="add-condition">Add Condition</button>
          <select data-testid="condition-mode-and-or" aria-label="Condition mode">
            <option>AND</option>
            <option>OR</option>
          </select>
          <button type="button" id="add-action">Add Action</button>
          <select data-testid="action-type" aria-label="Action type">
            <option>Set Value</option>
          </select>
          <select data-testid="action-target-element" aria-label="Action target">
            <option>First Name</option>
            <option>Last Name</option>
          </select>
          <input data-testid="action-value" aria-label="Action value" />
          <div id="rules"></div>
          <button role="menuitem" type="button" id="add-rule-below">Add Rule Below</button>
        </section>
      </section>
      <section aria-label="Properties">
        <label>Label <input aria-label="Label" /></label>
        <label>Min Length <input aria-label="Min Length" /></label>
        <label>Max Length <input aria-label="Max Length" /></label>
        <label>Hint <input aria-label="Hint" /></label>
        <label>Tooltip <input aria-label="Tooltip" /></label>
        <label>Default Value <input aria-label="Default Value" /></label>
      </section>
    </main>
    <script>
      const canvas = document.querySelector('[data-testid="form-canvas"]');
      const rules = document.querySelector('#rules');
      const addRuleBelow = document.querySelector('#add-rule-below');
      let selectedRuleNumber = 0;

      window.__addMockTextbox = () => {
        const field = document.createElement('input');
        field.dataset.testid = 'canvas-textbox';
        field.className = 'canvas-field-textbox';
        field.placeholder = 'Textbox';
        canvas.appendChild(field);
      };

      function addRule(afterNumber) {
        const nextNumber = rules.querySelectorAll('[data-testid="rule-card"]').length + 1;
        const card = document.createElement('article');
        card.dataset.testid = 'rule-card';
        card.innerHTML = '<strong>Rule' + nextNumber + '</strong><div class="expanded" data-expanded="true">Expanded</div><button type="button">Edit</button><button type="button" data-testid="context-menu" class="rule-context-menu-trigger">Menu</button>';
        card.querySelector('[data-testid="context-menu"]').addEventListener('click', () => {
          selectedRuleNumber = nextNumber;
          addRuleBelow.classList.add('visible');
        });
        const cards = Array.from(rules.querySelectorAll('[data-testid="rule-card"]'));
        const afterCard = cards.find((item) => item.textContent.includes('Rule' + afterNumber));
        if (afterCard && afterCard.nextSibling) rules.insertBefore(card, afterCard.nextSibling);
        else rules.appendChild(card);
      }

      document.querySelector('#add-rule').addEventListener('click', () => addRule());
      addRuleBelow.addEventListener('click', () => {
        addRule(selectedRuleNumber);
        addRuleBelow.classList.remove('visible');
      });
      document.querySelector('#add-condition').addEventListener('click', () => {
        const index = document.querySelectorAll('[data-testid^="condition-element-"]').length;
        const element = document.createElement('select');
        element.dataset.testid = 'condition-element-' + index;
        element.innerHTML = '<option>First Name</option><option>Last Name</option>';
        const type = document.createElement('select');
        type.dataset.testid = 'condition-type-' + index;
        type.innerHTML = '<option>Is Not Empty</option><option>Contains</option>';
        const value = document.createElement('input');
        value.dataset.testid = 'condition-value-' + index;
        document.querySelector('[data-testid="rules-list"]').append(element, type, value);
      });
    </script>
  </body>
</html>`;
}

module.exports = { mockAppHtml };
