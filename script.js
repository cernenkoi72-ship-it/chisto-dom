
// ЧИСТО.ДОМ v1.1
// КАЛЬКУЛЯТОР + ЗАЯВКИ + ПРОВЕРКА КОНТАКТОВ

// 1. Тарифы

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

// 2. Элементы страницы

const typeInput = document.querySelector("#cleaningType");
const areaInput = document.querySelector("#area");

const windowsInput = document.querySelector("#windows");
const ovenInput = document.querySelector("#oven");
const fridgeInput = document.querySelector("#fridge");

const totalElement = document.querySelector("#total");
const detailsElement = document.querySelector("#priceDetails");

const form = document.querySelector("#requestForm");
const nameInput = document.querySelector("#clientName");
const contactInput = document.querySelector("#clientContact");
const commentInput = document.querySelector("#comment");

const resultBox = document.querySelector("#requestResult");
const resultText = document.querySelector("#resultText");
const copyButton = document.querySelector("#copyButton");
const copyStatus = document.querySelector("#copyStatus");

// 3. Форматирование денег

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

// 4. Расчёт стоимости

function calculatePrice() {
  const area = Number(areaInput.value);

  if (
    areaInput.value.trim() === "" ||
    !Number.isInteger(area) ||
    area < 20 ||
    area > 300
  ) {
    totalElement.textContent = "—";

    detailsElement.textContent =
      "Введите целую площадь от 20 до 300 м²";

    return null;
  }

  const service = prices[typeInput.value];

  if (!service) {
    return null;
  }

  const basePrice = Math.max(
    area * service.rate,
    service.minimum
  );

  let extras = 0;

  if (windowsInput.checked) {
    extras += 800;
  }

  if (ovenInput.checked) {
    extras += 500;
  }

  if (fridgeInput.checked) {
    extras += 400;
  }

  const total = basePrice + extras;

  totalElement.textContent = formatPrice(total);

  detailsElement.textContent =
    `${service.name}, ${area} м². ` +
    `Основная уборка: ${formatPrice(basePrice)}. ` +
    `Дополнительно: ${formatPrice(extras)}.`;

  return {
    service: service.name,
    area: area,
    total: total,
    windows: windowsInput.checked,
    oven: ovenInput.checked,
    fridge: fridgeInput.checked
  };
}

// 5. Обновление калькулятора

const calculatorInputs = [
  typeInput,
  areaInput,
  windowsInput,
  ovenInput,
  fridgeInput
];

function hideOldResult() {
  resultBox.hidden = true;
  copyStatus.textContent = "";
}

calculatorInputs.forEach(function(element) {
  element.addEventListener("input", function() {
    calculatePrice();
    hideOldResult();
  });
});

// 6. Автоматический выбор тарифа

document
  .querySelectorAll("[data-cleaning-type]")
  .forEach(function(link) {

    link.addEventListener("click", function() {
      const selectedType = link.dataset.cleaningType;

      if (prices[selectedType]) {
        typeInput.value = selectedType;

        calculatePrice();
        hideOldResult();
      }
    });

  });

// 7. Проверка телефона или Telegram

function isValidContact(value) {
  const contact = value.trim();

  // Telegram: @username
  const telegramUsername =
    /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

  // Telegram: ссылка на профиль
  const telegramLink =
    /^https?:\/\/t\.me\/[a-zA-Z][a-zA-Z0-9_]{4,31}\/?$/;

  if (
    telegramUsername.test(contact) ||
    telegramLink.test(contact)
  ) {
    return true;
  }

  // Номер телефона: 10–15 цифр
  const phoneFormat = /^\+?[\d\s()\-]+$/;

  const digits = contact.replace(/\D/g, "");

  return (
    phoneFormat.test(contact) &&
    digits.length >= 10 &&
    digits.length <= 15
  );
}

contactInput.addEventListener("input", function() {
  contactInput.setCustomValidity("");
  hideOldResult();
});

nameInput.addEventListener("input", hideOldResult);
commentInput.addEventListener("input", hideOldResult);

// 8. Формирование заявки

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const calculation = calculatePrice();

  if (!calculation) {
    areaInput.focus();
    return;
  }

  const name = nameInput.value.trim();
  const contact = contactInput.value.trim();
  const comment = commentInput.value.trim();

  if (!name) {
    nameInput.focus();
    return;
  }

  if (!isValidContact(contact)) {
    contactInput.setCustomValidity(
      "Введите телефон от 10 цифр или Telegram вида @username"
    );

    contactInput.reportValidity();
    return;
  }

  const extras = [];

  if (calculation.windows) {
    extras.push("Мытьё окон");
  }

  if (calculation.oven) {
    extras.push("Мытьё духовки");
  }

  if (calculation.fridge) {
    extras.push("Мытьё холодильника");
  }

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

  copyStatus.textContent =
    "Текст готов. Заявка никуда не отправлена.";

  resultText.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

// 9. Копирование заявки

copyButton.addEventListener("click", async function() {
  try {
    await navigator.clipboard.writeText(resultText.value);

    copyStatus.textContent = "Текст скопирован!";
  } catch (error) {
    resultText.focus();
    resultText.select();

    copyStatus.textContent =
      "Нажмите Ctrl + C, чтобы скопировать текст.";
  }
});

// 10. Первый расчёт при открытии сайта

calculatePrice();
