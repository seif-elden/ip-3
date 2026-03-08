// ─── DOM Selection ───
const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll(".btn");

// ─── State ───
let current = "0";
let expression = "";
let lastOperator = false;
let evaluated = false;

// ─── Logic Functions ───
function resetCalc() {
  current = "0";
  expression = "";
  lastOperator = false;
  evaluated = false;
}

function appendNumber(num) {
  if (evaluated) {
    current = num === "." ? "0." : num;
    expression = "";
    evaluated = false;
  } else if (lastOperator) {
    current = num === "." ? "0." : num;
    lastOperator = false;
  } else {
    if (num === "." && current.includes(".")) return;
    current = current === "0" && num !== "." ? num : current + num;
  }
}

function appendOperator(op) {
  if (evaluated) {
    expression = "";
    evaluated = false;
  }

  if (lastOperator) {
    // Replace the trailing operator
    expression = expression.slice(0, -3) + " " + op + " ";
  } else {
    expression += current + " " + op + " ";
    lastOperator = true;
  }
}

function handleBackspace() {
  if (evaluated) return;
  if (lastOperator) {
    expression = expression.slice(0, -3);
    lastOperator = false;
    // Recover previous number from expression
    const parts = expression.trim().split(" ");
    current = parts.length ? parts.pop() : "0";
    expression = parts.length ? parts.join(" ") + " " : "";
  } else {
    current = current.length > 1 ? current.slice(0, -1) : "0";
  }
}

function calculate() {
  if (lastOperator) return; // incomplete expression

  const fullExpr = expression + current;
  try {
    // Safe evaluation: only allow numbers and basic operators
    if (!/^[\d\s+\-*/.%()]+$/.test(fullExpr)) return;

    let answer = Function('"use strict"; return (' + fullExpr + ")")();

    // Handle division by zero
    if (!isFinite(answer)) {
      current = "Error";
      expression = fullExpr + " =";
      evaluated = true;
      return;
    }

    // Round to avoid floating-point artifacts
    answer = parseFloat(answer.toPrecision(12));
    expression = fullExpr + " =";
    current = String(answer);
    evaluated = true;
  } catch {
    current = "Error";
    expression = fullExpr + " =";
    evaluated = true;
  }
}

// ─── Render ───
function render() {
  expressionEl.textContent = expression;
  resultEl.textContent = current;

  // Pop animation
  resultEl.classList.add("pop");
  setTimeout(() => resultEl.classList.remove("pop"), 150);
}

// ─── Event Handling ───
function handleAction(action) {
  switch (action) {
    case "clear":
      resetCalc();
      break;
    case "backspace":
      handleBackspace();
      break;
    case "=":
      calculate();
      break;
    case "+":
    case "-":
    case "*":
    case "/":
    case "%":
      appendOperator(action);
      break;
    default:
      appendNumber(action);
  }
  render();
}

// Button click listeners
buttons.forEach((btn) => {
  btn.addEventListener("click", () => handleAction(btn.dataset.action));
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (/^[0-9.]$/.test(key)) handleAction(key);
  else if (["+", "-", "*", "/", "%"].includes(key)) handleAction(key);
  else if (key === "Enter" || key === "=") {
    e.preventDefault();
    handleAction("=");
  }
  else if (key === "Backspace") handleAction("backspace");
  else if (key === "Escape" || key === "Delete") handleAction("clear");
});
