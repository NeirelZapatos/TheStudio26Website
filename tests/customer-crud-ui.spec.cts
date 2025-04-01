import "mocha";
import { Builder, By, until, WebDriver } from "selenium-webdriver";
import { strict as assert } from "assert";

describe("Customer Management Form - End-to-End Functionality Tests", function () {
  let driver: WebDriver;
  let testEmails: string[] = [];
  this.timeout(30000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
    await driver.get("http://localhost:3000/Dashboard");

    const customerTab = await driver.findElement(By.xpath("//*[contains(text(), 'Customer Management')]"));
    await customerTab.click();

    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Add New Customer')]")), 5000);
  });

  const fillForm = async (firstName: string, lastName: string, email: string, phone: string) => {
    const firstNameInput = await driver.findElement(By.css("input[placeholder='First Name']"));
    const lastNameInput = await driver.findElement(By.css("input[placeholder='Last Name']"));
    const emailInput = await driver.findElement(By.css("input[placeholder='Email']"));
    const phoneInput = await driver.findElement(By.css("input[placeholder='Phone Number (Optional)']"));
    const submitButton = await driver.findElement(By.css("button[type='submit']"));

    await firstNameInput.clear();
    await lastNameInput.clear();
    await emailInput.clear();
    await phoneInput.clear();

    await firstNameInput.sendKeys(firstName);
    await lastNameInput.sendKeys(lastName);
    await emailInput.sendKeys(email);
    await phoneInput.sendKeys(phone);
    await submitButton.click();
  };

  /**
   * Verifies that a valid customer with complete information can be created successfully.
   */
  it("creates a valid customer when all fields are filled correctly", async () => {
    const testEmail = `studio${Date.now()}@test.com`;
    testEmails.push(testEmail);
    await fillForm("Studio", "Test", testEmail, "5551234567");

    // Accept success alert
    await driver.wait(until.alertIsPresent(), 3000);
    const alert = await driver.switchTo().alert();
    await alert.accept();

    await driver.wait(until.elementLocated(By.css(".space-y-4")), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//span[contains(@class, 'text-sm') and contains(text(), '${testEmail}')]`)), 10000);
  });

  /**
   * Ensures that a customer cannot be created when only the first name is provided.
   */
  it("prevents creation with only a first name", async () => {
    const email = `onlyfirst-${Date.now()}@test.com`;
    await fillForm("Studio", "", email, "5551234567");
    const entries = await driver.findElements(By.xpath(`//*[contains(text(), '${email}')]`));
    assert.equal(entries.length, 0, "Customer should not be created with only a first name");
  });

  /**
   * Ensures that a customer cannot be created when only the last name is provided.
   */
  it("prevents creation with only a last name", async () => {
    const email = `onlylast-${Date.now()}@test.com`;
    await fillForm("", "Test", email, "5551234567");
    const entries = await driver.findElements(By.xpath(`//*[contains(text(), '${email}')]`));
    assert.equal(entries.length, 0, "Customer should not be created with only a last name");
  });

  /**
   * Ensures the system does not allow duplicate customer records with the same email.
   */
  it("prevents creation of duplicate customers using the same email", async () => {
    const duplicateEmail = testEmails[0];
    await fillForm("Studio", "Test", duplicateEmail, "5551234567");
    const existingDuplicates = await driver.findElements(By.xpath(`//*[contains(text(), '${duplicateEmail}')]`));
    assert.equal(existingDuplicates.length, 1, "Duplicate customer was allowed");
  });

  /**
   * Validates that the form rejects invalid email format inputs.
   */
  it("rejects customer creation with an invalid email format", async () => {
    await fillForm("Studio", "Test", "bademail@", "5551234567");
    const entries = await driver.findElements(By.xpath(`//*[contains(text(), 'bademail@')]`));
    assert.equal(entries.length, 0, "Customer should not be created with invalid email");
  });

  /**
   * Validates that the form rejects phone numbers containing alphabetic characters.
   */
  it("rejects customer creation with an alphabetic phone number", async () => {
    const email = `badphone${Date.now()}@test.com`;
    await fillForm("Studio", "Test", email, "abcde");
    const entries = await driver.findElements(By.xpath(`//*[contains(text(), '${email}')]`));
    assert.equal(entries.length, 0, "Customer should not be created with invalid phone number");
  });

  /**
   * Tests that the search functionality can locate a customer by email.
   */
  it("searches and locates a customer by email", async () => {
    const testEmail = testEmails[0];
    const searchInput = await driver.findElement(By.css("input[placeholder='Search by name or email']"));

    await searchInput.clear();
    await searchInput.sendKeys(testEmail);
    await driver.sleep(500); // Allow filtering to apply

    const matches = await driver.findElements(By.xpath(`//*[contains(text(), '${testEmail}')]`));
    assert.ok(matches.length > 0, "Customer not found using email search");
  });

  /**
   * Tests that the search functionality can locate a customer by name.
   */
  it("searches and locates a customer by name", async () => {
    const testEmail = testEmails[0];
    const searchInput = await driver.findElement(By.css("input[placeholder='Search by name or email']"));

    await searchInput.clear();
    await searchInput.sendKeys("Studio");
    await driver.sleep(500);

    const matches = await driver.findElements(By.xpath(`//*[contains(text(), '${testEmail}')]`));
    assert.ok(matches.length > 0, "Customer not found using name search");
  });

  /**
   * Deletes all test-created customers and handles confirmation/success alerts appropriately.
   */
  it("deletes all customers created during tests", async () => {
    // Allowed alert messages
    const ALLOWED_ALERTS = [
      "Are you sure you want to delete this customer? This action cannot be undone.",
      "Customer deleted successfully!"
    ];
  
    // Helper to handle alerts with specific messages
    const handleAllowedAlerts = async () => {
      try {
        await driver.wait(until.alertIsPresent(), 500);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        
        if (ALLOWED_ALERTS.some(allowed => alertText.includes(allowed))) {
          await alert.accept();
          await driver.sleep(100);
        } else {
          throw new Error(`Unexpected alert during deletion: "${alertText}"`);
        }
      } catch (e) {
        // Only rethrow if it's not a "no alert present" error
        if (!(e instanceof Error) || 
            !e.message.includes('NoSuchAlertError') && 
            !e.message.includes('TimeoutError')) {
          throw e;
        }
      }
    };
  
    for (const email of testEmails) {
      try {
        const customerContainers = await driver.findElements(
          By.xpath(`//*[contains(text(), '${email}')]/ancestor::div[contains(@class, 'bg-gray-50')]`)
        );
        
        if (customerContainers.length > 0) {
          const deleteButton = await customerContainers[0].findElement(
            By.xpath(`.//button[@title='Delete Customer']`)
          );
          
          await deleteButton.click();
          
          // Handle allowed alerts (confirmation)
          await handleAllowedAlerts();
          
          // Wait for deletion to complete
          await driver.wait(until.stalenessOf(customerContainers[0]), 5000);
          
          // Handle allowed alerts (success message)
          await handleAllowedAlerts();
        }
      } catch (error) {
        // Only fail for non-alert related errors
        if (!(error instanceof Error) || 
            !error.message.includes('alert') && 
            !error.message.includes('NoSuchAlertError')) {
          throw error;
        }
      }
    }
  });
  
  // New helper function with more robust alert handling
  const handleAlertWithRetry = async (maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await driver.wait(until.alertIsPresent(), 500);
        const alert = await driver.switchTo().alert();
        await alert.accept();
        await driver.sleep(200); // Small pause after accepting
        return; // Successfully handled alert
      } catch (e) {
        if (i === maxRetries - 1) throw e; // Throw error on last retry
        await driver.sleep(200); // Wait before retrying
      }
    }
  };

  
  
  // Enhanced version of your original function
  const safelyDismissAlert = async () => {
    try {
      await handleAlertWithRetry(1); // Try once quickly
    } catch (e) {
      // No alert present, which is fine
    }
  };

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });
});
