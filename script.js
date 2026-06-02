const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
const faqItems = document.querySelectorAll(".faq-item");
const form = document.querySelector(".contact-form");
const formMessage = document.querySelector(".form-message");
const revealElements = document.querySelectorAll(".reveal");

if (burger && nav) {
  const closeMenu = () => {
    burger.classList.remove("is-active");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  };

  burger.addEventListener("click", () => {
    const isOpen = burger.classList.toggle("is-active");
    nav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

if (faqItems.length) {
  faqItems.forEach((item) => {
    const button = item.querySelector("button");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      faqItems.forEach((currentItem) => {
        const currentButton = currentItem.querySelector("button");
        const currentAnswer = currentItem.querySelector(".faq-answer");

        currentItem.classList.remove("is-open");
        currentButton?.setAttribute("aria-expanded", "false");

        if (currentAnswer) {
          currentAnswer.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

if (form && formMessage) {
  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonText = submitButton?.textContent || "Отправить заявку";

  const setFormMessage = (text, type) => {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
  };

  const setFormLoading = (isLoading) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Отправка..." : defaultButtonText;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const fields = [...form.querySelectorAll("input, textarea")];

    fields.forEach((field) => {
      field.classList.toggle("field-error", !field.value.trim());
    });

    if (!name || !contact || !message) {
      setFormMessage("Пожалуйста, заполните все поля формы.", "error");
      fields.find((field) => !field.value.trim())?.focus();
      return;
    }

    setFormLoading(true);
    setFormMessage("", "");

    try {
      const response = await fetch("/.netlify/functions/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          contact,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      setFormMessage("Спасибо! Заявка отправлена. Я свяжусь с вами в ближайшее время.", "success");
    } catch (error) {
      setFormMessage("Не удалось отправить заявку. Попробуйте ещё раз или напишите мне напрямую в Telegram.", "error");
    } finally {
      setFormLoading(false);
    }
  });

  form.addEventListener("input", (event) => {
    if (event.target.matches("input, textarea")) {
      event.target.classList.remove("field-error");
    }
  });
}

if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -60px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}
