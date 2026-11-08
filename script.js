
const prices = {
  regular: {
    name: "Поддерживающая",
    rate: 70,
    minimum: 1500
  },
  general: {
    name: "Генеральная",
    rate: 130,
    minimum: 3000
  },
  renovation: {
    name: "После ремонта",
    rate: 180,
    minimum: 5000
  }
};

const typeInput = document.querySelector("#cleaningType");
const areaInput = document.querySelector("#area");
const windowsInput = document.querySelector("#windows");
const ovenInput = document.querySelector("#oven");
const fridgeInput = document.querySelector("#fridge");

const totalElement = document.querySelector("#total");
const detailsElement = document.querySelector("#priceDetails");

const form = document.querySelector("#requestForm");
const resultBox = document.querySelector("#requestResult");
const resultText = document.querySelector("#resultText");
const copyButton = document.querySelector("#copyButton");
const copyStatus = document.querySelector("#copyStatus");

const formatPrice = (value) => {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
};

function calculatePrice() {
  const area = Number(areaInput.value);

  if (!Number.isFinite(area) || area < 20 || area > 300) {
    totalElement.textContent = "—";
    detailsElement.textContent = "Введите площадь от 20 до 300 м²";
    return null;
  }

  const service = prices[typeInput.value];

  let basePrice = Math.max(
    area * service.rate,
    service.minimum
  );

  let extras = 0;

  if (windowsInput.checked) extras += 800;
  if (ovenInput.checked) extras += 500;
  if (fridgeInput.checked) extras += 400;

  const total = basePrice + extras;

  totalElement.textContent = formatPrice(total);
  detailsElement.textContent =
    `${service.name}, ${area} м². ` +
    `Основная уборка: ${formatPrice(basePrice)}. ` +
    `Дополнительно: ${formatPrice(extras)}.`;

  return {
    service: service.name,
    area,
    total,
    windows: windowsInput.checked,
    oven: ovenInput.checked,
    fridge: fridgeInput.checked
  };
}

[
  typeInput,
  areaInput,
  windowsInput,
  ovenInput,
  fridgeInput
].forEach((element) => {
  element.addEventListener("input", calculatePrice);
});

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const calculation = calculatePrice();

  if (!calculation) {
    areaInput.focus();
    return;
  }

  const name = document.querySelector("#clientName").value.trim();
  const contact = document.querySelector("#clientContact").value.trim();
  const comment = document.querySelector("#comment").value.trim();

  if (!name || !contact) {
    alert("Заполните имя и контакт для связи.");
    return;
  }

  const extras = [];

  if (calculation.windows) extras.push("Мытьё окон");
  if (calculation.oven) extras.push("Мытьё духовки");
  if (calculation.fridge) extras.push("Мытьё холодильника");

  const message = [
    "ЗАЯВКА НА УБОРКУ (ДЕМО)",
    "",
    `Имя: ${name}`,
    `Контакт: ${contact}`,
    `Тип уборки: ${calculation.service}`,
    `Площадь: ${calculation.area} м²`,
    `Дополнительные услуги: ${extras.join(", ") || "Нет"}`,
    `Предварительная стоимость: ${formatPrice(calculation.total)}`,
    `Комментарий: ${comment || "Нет"}`,
    "",
    "Стоимость предварительная, требует подтверждения."
  ].join("\n");

  resultText.value = message;
  resultBox.hidden = false;
  copyStatus.textContent = "Текст готов. Заявка никуда не отправлена.";
  resultText.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

copyButton.addEventListener("click", async function() {
  try {
    await navigator.clipboard.writeText(resultText.value);
    copyStatus.textContent = "Текст скопирован!";
  } catch {
    resultText.focus();
    resultText.select();
    copyStatus.textContent =
      "Нажмите Ctrl + C, чтобы скопировать выделенный текст.";
  }
});

calculatePrice();
