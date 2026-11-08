(function () {
  "use strict";
  function numberOf(text) {
    const fractions = {"¼":.25,"½":.5,"¾":.75,"⅛":.125,"⅜":.375,"⅝":.625,"⅞":.875};
    const match = text.match(/^(\d+(?:[.,]\d+)?)([¼½¾⅛⅜⅝⅞])?$/);
    if (match) return Number(match[1].replace(",",".")) + (fractions[match[2]] || 0);
    if (fractions[text] !== undefined) return fractions[text];
    return null;
  }
  function amount(n) {
    const rounded = Math.round(n * 16);
    const whole = Math.floor(rounded / 16);
    const remainder = rounded % 16;
    const fractions = {2:"⅛",4:"¼",6:"⅜",8:"½",10:"⅝",12:"¾",14:"⅞"};
    if (!remainder) return String(whole);
    if (fractions[remainder]) return (whole ? whole + " " : "") + fractions[remainder];
    return String(Number(n.toFixed(2)));
  }
  const qty = String.raw`(?:\d+(?:[.,]\d+)?[¼½¾⅛⅜⅝⅞]?|[¼½¾⅛⅜⅝⅞])`;
  const leading = new RegExp("^(" + qty + ")(?:\\s*([–-])\\s*(" + qty + "))?(?=\\s|$)");
  function scale(text, factor) {
    const match = text.match(leading);
    if (!match) return text;
    const first = numberOf(match[1]);
    const last = match[3] ? numberOf(match[3]) : null;
    if (first === null || (match[3] && last === null)) return text;
    const display = amount(first * factor) + (match[3] ? match[2] + amount(last * factor) : "");
    return display + text.slice(match[0].length);
  }
  document.querySelectorAll(".scaler[data-base-servings]").forEach(function (widget) {
    const base = Number(widget.dataset.baseServings);
    const input = widget.querySelector(".recipe-servings");
    const display = document.getElementById(widget.dataset.yieldId);
    const buttons = Array.from(widget.querySelectorAll("[data-scale]"));
    const ingredients = Array.from(widget.closest("article").querySelectorAll(".scalable-ingredient"));
    let current = base;
    function update(n) {
      if (!Number.isFinite(n) || n < .5 || n > 999) return;
      current = n;
      input.value = String(n);
      display.textContent = n + (n === 1 ? " serving" : " servings");
      ingredients.forEach(function (el) { el.textContent = scale(el.dataset.original, n / base); });
      buttons.forEach(function (b) {
        const active = Math.abs(n - base * Number(b.dataset.scale)) < .00001;
        b.classList.toggle("selected", active);
        b.setAttribute("aria-pressed", String(active));
      });
    }
    buttons.forEach(function (b) { b.addEventListener("click", function () { update(base * Number(b.dataset.scale)); }); });
    input.addEventListener("input", function () { if (input.value !== "") update(Number(input.value)); });
    input.addEventListener("change", function () { if (input.value === "" || Number(input.value) < .5 || Number(input.value) > 999) input.value = String(current); });
    widget.querySelector(".servings-minus").addEventListener("click", function () { update(Math.max(.5, current - 1)); });
    widget.querySelector(".servings-plus").addEventListener("click", function () { update(Math.min(999, current + 1)); });
    widget.querySelector(".reset-scale").addEventListener("click", function () { update(base); });
    update(base);
  });
})();