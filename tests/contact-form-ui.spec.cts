import "mocha";
import { Builder, By, until, WebDriver } from "selenium-webdriver";
import { strict as assert } from "assert";

describe("Contact Form Validation", function () {
  let driver: WebDriver;
  this.timeout(30000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
    await driver.get("http://localhost:3000/Contact");
  });

  const fillContactForm = async (form: { [key: string]: string | undefined }) => {
    const selectors: { [key: string]: string } = {
      firstName: "input[name='firstName']",
      lastName: "input[name='lastName']",
      email: "input[name='email']",
      phone: "input[name='phone']",
      subject: "input[name='subject']",
      message: "textarea[name='message']",
      submit: "button[type='submit']",
    };

    for (const key of Object.keys(selectors)) {
      if (key === "submit") continue;
      const input = await driver.findElement(By.css(selectors[key]));
      await input.clear();
      if (form[key]) {
        await input.sendKeys(form[key]!);
      }
    }

    const submitButton = await driver.findElement(By.css(selectors.submit));
    await driver.wait(until.elementIsEnabled(submitButton), 3000);
    await driver.wait(until.elementIsVisible(submitButton), 3000);
  };

  // Helper function to check for specific error message
  const checkErrorMessage = async (possibleMessages: string | string[]) => {
    const messages = Array.isArray(possibleMessages) ? possibleMessages : [possibleMessages];
    await driver.sleep(500); // Add small delay for validation to complete
    
    for (const message of messages) {
      try {
        // Try direct text match first
        const error = await driver.wait(
          until.elementLocated(By.xpath(`//*[contains(text(),'${message}')]`)),
          3000
        );
        if (await error.isDisplayed()) return true;
      } catch {
        // If not found, try checking all error elements
        try {
          const errorElements = await driver.findElements(By.css(".error-message, .text-red-500, [role='alert']"));
          for (const el of errorElements) {
            const text = await el.getText();
            if (text.includes(message)) return true;
          }
        } catch {
          continue;
        }
      }
    }
    return false;
  };

  // Test optional fields individually first
  describe("Optional Field Tests", () => {
    it("should submit when optional fields are empty", async () => {
      await fillContactForm({
        email: `test${Date.now()}@email.com`,
        subject: "Only required fields",
        message: "This should succeed with empty optional fields"
      });
      const submitButton = await driver.findElement(By.css("button[type='submit']"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(200);
      await driver.wait(until.elementIsEnabled(submitButton), 3000);
      await driver.wait(until.elementIsVisible(submitButton), 3000);
      await submitButton.click();

      const successEl = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Message sent successfully!')]")),
        5000
      );
      assert.ok(await successEl.isDisplayed(), "Form should submit without optional fields");
    });

    describe("First Name (Optional)", () => {
      it("should reject excessively long first name (>255 chars)", async () => {
        await fillContactForm({
          firstName: "A".repeat(256),
          email: `test${Date.now()}@email.com`,
          subject: "Long first name test",
          message: "Testing first name length"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const successElements = await driver.findElements(By.xpath("//*[contains(text(),'Message sent successfully!')]"));
        assert.strictEqual(successElements.length, 0, "Form should not submit with long first name");
      });
    });

    describe("Last Name (Optional)", () => {
      it("should reject excessively long last name (>255 chars)", async () => {
        await fillContactForm({
          lastName: "B".repeat(256),
          email: `test${Date.now()}@email.com`,
          subject: "Long last name test",
          message: "Testing last name length"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const successElements = await driver.findElements(By.xpath("//*[contains(text(),'Message sent successfully!')]"));
        assert.strictEqual(successElements.length, 0, "Form should not submit with long last name");
      });
    });

    describe("Phone Number (Optional)", () => {
      it("should reject invalid phone format", async () => {
        await fillContactForm({
          phone: "invalid-phone",
          email: `test${Date.now()}@email.com`,
          subject: "Invalid phone test",
          message: "Testing phone validation"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const errorElements = await driver.findElements(By.css(".text-red-500"));
        const errorTexts = await Promise.all(errorElements.map((e) => e.getText()));
        const hasError = errorTexts.some((t) => t.toLowerCase().includes("must be in the format") || t.toLowerCase().includes("invalid"));
        assert.ok(hasError, "Should show error for invalid phone format");
      });

      it("should reject phone number that is too short", async () => {
        await fillContactForm({
          phone: "123-456",
          email: `test${Date.now()}@email.com`,
          subject: "Short phone test",
          message: "Testing short phone number"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const errorElements = await driver.findElements(By.css(".text-red-500"));
        const errorTexts = await Promise.all(errorElements.map((e) => e.getText()));
        const hasError = errorTexts.some((t) => t.toLowerCase().includes("must be in the format") || t.toLowerCase().includes("invalid"));
        assert.ok(hasError, "Should show error for short phone number");
      });

      it("should reject phone number that is too long", async () => {
        await fillContactForm({
          phone: "123-456-7890123456",
          email: `test${Date.now()}@email.com`,
          subject: "Long phone test",
          message: "Testing long phone number"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const errorElements = await driver.findElements(By.css(".text-red-500"));
        const errorTexts = await Promise.all(errorElements.map((e) => e.getText()));
        const hasError = errorTexts.some((t) => t.toLowerCase().includes("must be in the format") || t.toLowerCase().includes("invalid"));
        assert.ok(hasError, "Should show error for long phone number");
      });

      it("should accept valid phone format (123-456-7890)", async () => {
        await fillContactForm({
          phone: "123-456-7890",
          email: `test${Date.now()}@email.com`,
          subject: "Valid phone test",
          message: "Testing valid phone"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const successEl = await driver.wait(
          until.elementLocated(By.xpath("//*[contains(text(),'Message sent successfully!')]")),
          5000
        );
        assert.ok(await successEl.isDisplayed(), "Form should accept valid phone format");
      });
    });
  });

  // Test required fields validation
  describe("Required Field Validation", () => {
    it("should reject empty form submission", async () => {
      await fillContactForm({});
      const submitButton = await driver.findElement(By.css("button[type='submit']"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(200);
      await driver.wait(until.elementIsEnabled(submitButton), 3000);
      await driver.wait(until.elementIsVisible(submitButton), 3000);
      await submitButton.click();
      const success = await checkErrorMessage("Message sent successfully!");
      assert.ok(!success, "Form should not submit with empty fields");
    });

    describe("Email Validation", () => {
      it("should reject empty email", async () => {
        await fillContactForm({
          subject: "Missing email test",
          message: "Testing required email"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const errorElements = await driver.findElements(By.css(".text-red-500"));
        const errorTexts = await Promise.all(errorElements.map((e) => e.getText()));
        const hasError = errorTexts.some((t) => t.toLowerCase().includes("required"));
        assert.ok(hasError, "Should show error for missing email");
      });
    
      it("should reject invalid email format", async () => {
        const timestamp = Date.now();
        await fillContactForm({
          email: "invalid-email",
          subject: `Invalid email test ${timestamp}`,
          message: "This should fail to send"
        });

        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const success = await checkErrorMessage("Message sent successfully!");
        assert.ok(!success, "Form should not submit with invalid email format");
      });
    });

    describe("Subject Validation", () => {
      it("should reject empty subject", async () => {
        await fillContactForm({
          email: `test${Date.now()}@email.com`,
          subject: "",
          message: "Testing empty subject"
        });
        await driver.sleep(1000);
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();

        const successElements = await driver.findElements(By.xpath("//*[contains(text(),'Message sent successfully!')]"));
        assert.strictEqual(successElements.length, 0, "Form should not submit when subject is empty");
      });

      it("should reject long subject (>255 chars)", async () => {
        await fillContactForm({
          email: `test${Date.now()}@email.com`,
          subject: "S".repeat(256),
          message: "Testing long subject"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();
        const success = await checkErrorMessage("Message sent successfully!");
        assert.ok(!success, "Form should not submit with long subject");
      });
    });

    describe("Message Validation", () => {
      it("should reject empty message", async () => {
        await fillContactForm({
          email: `test${Date.now()}@email.com`,
          subject: "Empty message test",
          message: ""
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();
        const successElements = await driver.findElements(By.xpath("//*[contains(text(),'Message sent successfully!')]"));
        assert.strictEqual(successElements.length, 0, "Form should not submit with empty message");
      });

      it("should reject very short message (<10 chars)", async () => {
        await fillContactForm({
          email: `test${Date.now()}@email.com`,
          subject: "Short message test",
          message: "Short"
        });
        const submitButton = await driver.findElement(By.css("button[type='submit']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
        await driver.sleep(200);
        await driver.wait(until.elementIsEnabled(submitButton), 3000);
        await driver.wait(until.elementIsVisible(submitButton), 3000);
        await submitButton.click();
        const successElements = await driver.findElements(By.xpath("//*[contains(text(),'Message sent successfully!')]"));
        assert.strictEqual(successElements.length, 0, "Form should not submit with very short message");
      });
    });
  });


  after(async () => {
    // Pause briefly to ensure the last test completes
    await driver.sleep(5000);
    if (driver) await driver.quit();
  });
});