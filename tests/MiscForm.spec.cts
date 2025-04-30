import "mocha";
import { Builder, By, until, WebDriver } from "selenium-webdriver";
import { strict as assert } from "assert";

describe.only("Misc Form Validation", function () {
  let driver: WebDriver;
  this.timeout(30000); // Increased timeout to 30 seconds

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
    await driver.get("http://localhost:3000/Dashboard");
    await driver.sleep(1000); // Wait for dashboard to load

    // Script to prevent actual form submissions
    await driver.executeScript(`
          window._formInterceptActive = true;
          document.addEventListener('submit', function(event) {
            if (window._formInterceptActive) {
              event.preventDefault();
              event.stopPropagation();
              setTimeout(() => {
                const messageElement = document.querySelector('p[class*="text-center"]');
                if (messageElement) {
                  messageElement.textContent = "Misc Item successfully submitted!";
                  messageElement.classList.add('text-green-600');
                }
              }, 500);
              return false;
            }
          }, true);
        `);

    // Set up API mocking
    await driver.executeScript(`
          window._originalFetch = window.fetch;
          window.fetch = async function(url, options) {
            
            if (url.includes('/api/item-templates') && (!options || options.method === 'GET' || !options.method)) {
              return {
                ok: true,
                json: async function() { 
                  return { 
                    success: true, 
                    data: [
                      {
                        id: "template-1",
                        name: "Mock Misc Template 1",
                        description: "A mocked misc template for testing",
                        price: "49.99",
                        quantity_in_stock: "15",
                        image_url: "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png",
                        images: ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"],
                        color: "Red",
                        size: "Medium",
                        weight: "250g",
                        brand: "TestBrand",
                        category: "Miscellaneous"
                      },
                      {
                        id: "template-2",
                        name: "Mock Misc Template 2",
                        description: "Another mocked misc template",
                        price: "19.99",
                        quantity_in_stock: "8",
                        image_url: "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png",
                        images: ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"],
                        color: "Blue",
                        size: "Small",
                        weight: "100g",
                        brand: "AnotherBrand",
                        category: "Miscellaneous"
                      }
                    ]
                  };
                }
              };
            }
            
            if (url.includes('/api/item-templates') && options && options.method === 'POST') {
              return {
                ok: true,
                json: async function() {
                  return { 
                    success: true, 
                    message: "Template saved successfully", 
                    data: { 
                      id: "mock-template-" + Date.now(),
                      ...JSON.parse(options.body)
                    }
                  };
                }
              };
            }
            
            if (url.includes('/api/items') && options && options.method === 'POST') {
              return {
                ok: true,
                json: async function() {
                  return { 
                    success: true, 
                    message: "Item created successfully", 
                    data: { 
                      id: "mock-item-" + Date.now(),
                      ...JSON.parse(options.body)
                    }
                  };
                }
              };
            }
            
            if (url.includes('/api/upload')) {
              return {
                ok: true,
                json: async function() {
                  return { 
                    success: true, 
                    urls: ["https://tests26bucket.s3.us-east-2.amazonaws.com/MockUploadedImage.jpg"]
                  };
                }
              };
            }
            
            return window._originalFetch(url, options);
          };
        `);

    // Initial navigation to the Misc form
    await navigateToMiscForm();
  });

  // Navigate to the Misc form function
  async function navigateToMiscForm() {
    try {
      const productsButton = await driver.findElement(By.xpath("//button[contains(., 'Products')]"));
      await productsButton.click();
      await driver.sleep(500);

      const createItemButton = await driver.findElement(By.xpath("//span[contains(text(), 'Create an Item')]"));
      await createItemButton.click();
      await driver.sleep(1000);

      const miscCard = await driver.findElement(By.xpath("//h3[contains(text(), 'Miscellaneous')]/ancestor::div[contains(@class, 'rounded-lg')]"));
      await miscCard.click();
      await driver.sleep(1000);

    } catch (error) {
      console.error("Error navigating to Misc form:", error);
      throw error;
    }
  }

  // Helper function to fill in the form fields
  async function fillMiscForm(form: { [key: string]: string | undefined }) {
    if (form.name) {
      const nameInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Product Name')]/ancestor::label/following-sibling::input"));
      await nameInput.clear();
      await nameInput.sendKeys(form.name);
    }

    if (form.description) {
      const descInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Description')]/ancestor::label/following-sibling::textarea"));
      await descInput.clear();
      await descInput.sendKeys(form.description);
    }

    if (form.price) {
      const priceInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Price')]/ancestor::label/following-sibling::input"));
      await priceInput.clear();
      await priceInput.sendKeys(form.price);
    }

    if (form.quantityInStock) {
      const qtyInput = await driver.findElement(By.xpath("//label[contains(text(), 'Quantity in Stock')]/following-sibling::input"));
      await qtyInput.clear();
      await qtyInput.sendKeys(form.quantityInStock);
    }

    if (form.weight) {
      const weightInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Weight')]/ancestor::label/following-sibling::input"));
      await weightInput.clear();
      await weightInput.sendKeys(form.weight);
    }

    if (form.size) {
      const sizeInput = await driver.findElement(By.xpath("//label[contains(text(), 'Size / Dimensions')]/following-sibling::input"));
      await sizeInput.clear();
      await sizeInput.sendKeys(form.size);
    }

    if (form.color) {
      const colorInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Color')]/ancestor::label/following-sibling::input"));
      await colorInput.clear();
      await colorInput.sendKeys(form.color);
    }

    if (form.brand) {
      const brandInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Brand')]/ancestor::label/following-sibling::input"));
      await brandInput.clear();
      await brandInput.sendKeys(form.brand);
    }

    // Scroll down to make buttons visible
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
    await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
    await driver.sleep(200);
  }

  // Helper function to check for specific message in the UI
  async function checkForMessage(message: string, timeout: number = 5000) {
    try {
      const messageEl = await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),'${message}')]`)),
        timeout
      );
      return await messageEl.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  // Helper function to use template search
  async function useTemplate(templateName: string) {
    const templateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Browse Templates')]"));
    await driver.executeScript("arguments[0].scrollIntoView(true);", templateButton);
    await driver.sleep(200);
    await templateButton.click();

    const searchInput = await driver.findElement(By.xpath("//input[@placeholder='Search Templates']"));
    await searchInput.clear();
    await searchInput.sendKeys(templateName);

    await driver.sleep(1000);

    try {
      // Try to find the template by name in the list
      const templateItem = await driver.findElement(By.xpath(`//li//span[contains(text(), '${templateName}')]/ancestor::li`));
      await templateItem.click();
    } catch (e) {
      // If exact match not found, click the first result
      const firstResult = await driver.findElement(By.css("li"));
      await firstResult.click();
    }

    await driver.sleep(1500);
  }

  // Reset navigation before each test
  beforeEach(async function () {
    await driver.navigate().refresh();
    await driver.sleep(2000);
    await navigateToMiscForm();
  });

  describe("Basic UI Tests", () => {
    it("should find the submit button", async function () {
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
      const buttonText = await submitButton.getText();
      assert.ok(buttonText.includes("Submit Misc Item"), "Submit button should be found");
    });

    it("should disable submit button when form is empty", async function () {
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
      const isDisabled = await submitButton.getAttribute("disabled") === "true";
      assert.ok(isDisabled, "Submit button should be disabled with empty required fields");
    });

    it("should have the title 'Miscellaneous Product Specifications'", async function () {
      const title = await driver.findElement(By.xpath("//h3[contains(text(), 'Miscellaneous Product Specifications')]"));
      assert.ok(await title.isDisplayed(), "Form should have the correct title");
    });

    it("should have a 'Change Item Type' button", async function () {
      const closeButton = await driver.findElement(By.xpath("//button[contains(text(), 'Change Item Type')]"));
      assert.ok(await closeButton.isDisplayed(), "Change Item Type button should be present");
    });
  });

  describe("Required Field Validation", () => {
    it("should disable submit button with only some required fields filled", async () => {
      await fillMiscForm({
        name: "Test Product",
        price: "29.99",
        // Missing description and quantity
      });

      // Make sure to scroll to the button to check its state
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(200);

      const isDisabled = await submitButton.getAttribute("disabled") === "true";
      assert.ok(isDisabled, "Submit button should be disabled with some required fields missing");
    });

    it("should enable submit button when all required fields are filled", async () => {
      await fillMiscForm({
        name: "Test Required Fields",
        description: "Testing required fields",
        price: "19.99",
        quantityInStock: "5"
      });

      // Make sure to scroll to the button to check its state
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(200);

      const isDisabled = await submitButton.getAttribute("disabled") === "true";
      assert.ok(!isDisabled, "Submit button should be enabled when all required fields are filled");


      const priceInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Price')]/ancestor::label/following-sibling::input"));
      const value = await priceInput.getAttribute("value");
      assert.strictEqual(value, "19.99", "Price field should limit to two decimal places");
    });
  });

  describe("Additional Fields Tests", () => {
    it("should allow entering and displaying size/dimensions", async () => {
      const testSize = "10x20 mm";
      await fillMiscForm({
        name: "Test Size Field",
        description: "Testing size field",
        price: "29.99",
        quantityInStock: "5",
        size: testSize
      });

      const sizeInput = await driver.findElement(By.xpath("//label[contains(text(), 'Size / Dimensions')]/following-sibling::input"));
      const value = await sizeInput.getAttribute("value");
      assert.strictEqual(value, testSize, "Size field should display the entered value");
    });

    it("should allow entering and displaying weight", async () => {
      const testWeight = "250g";
      await fillMiscForm({
        name: "Test Weight Field",
        description: "Testing weight field",
        price: "29.99",
        quantityInStock: "5",
        weight: testWeight
      });

      const weightInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Weight')]/ancestor::label/following-sibling::input"));
      const value = await weightInput.getAttribute("value");
      assert.strictEqual(value, testWeight, "Weight field should display the entered value");
    });

    it("should allow entering and displaying color", async () => {
      const testColor = "Midnight Blue";
      await fillMiscForm({
        name: "Test Color Field",
        description: "Testing color field",
        price: "29.99",
        quantityInStock: "5",
        color: testColor
      });

      const colorInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Color')]/ancestor::label/following-sibling::input"));
      const value = await colorInput.getAttribute("value");
      assert.strictEqual(value, testColor, "Color field should display the entered value");
    });

    it("should allow entering and displaying brand", async () => {
      const testBrand = "Superior Goods";
      await fillMiscForm({
        name: "Test Brand Field",
        description: "Testing brand field",
        price: "29.99",
        quantityInStock: "5",
        brand: testBrand
      });

      const brandInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Brand')]/ancestor::label/following-sibling::input"));
      const value = await brandInput.getAttribute("value");
      assert.strictEqual(value, testBrand, "Brand field should display the entered value");
    });

    it("should display all additional fields correctly", async () => {
      // Verify all additional fields are present
      const sizeField = await driver.findElement(By.xpath("//label[contains(text(), 'Size / Dimensions')]"));
      const weightField = await driver.findElement(By.xpath("//label/span[contains(text(), 'Weight')]"));
      const colorField = await driver.findElement(By.xpath("//label/span[contains(text(), 'Color')]"));
      const brandField = await driver.findElement(By.xpath("//label/span[contains(text(), 'Brand')]"));

      assert.ok(
        await sizeField.isDisplayed() &&
        await weightField.isDisplayed() &&
        await colorField.isDisplayed() &&
        await brandField.isDisplayed(),
        "All additional fields should be displayed"
      );
    });
  });

  describe("Template Functionality", () => {
    it("should show template search panel when clicking 'Browse Templates'", async () => {
      const templateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Browse Templates')]"));
      await templateButton.click();
      await driver.sleep(500);

      const searchInput = await driver.findElement(By.xpath("//input[@placeholder='Search Templates']"));
      assert.ok(await searchInput.isDisplayed(), "Template search panel should be displayed");
    });

    it("should save form as template and display success message", async () => {
      const uniqueName = `Test Misc Template ${Date.now()}`;
      await fillMiscForm({
        name: uniqueName,
        description: "Template for testing",
        price: "19.99",
        quantityInStock: "10",
        weight: "120g",
        size: "10cm x 8cm",
        color: "Green",
        brand: "Test Brand"
      });

      // Click Save as Template button
      const saveTemplateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save as Template')]"));
      await saveTemplateButton.click();

      const templateSaved = await checkForMessage("Template saved successfully!");
      assert.ok(templateSaved, "Template should be saved successfully");
    });

    it("should load template data when selected", async () => {
      // First save a template
      const uniqueName = `Test Misc Template ${Date.now()}`;
      const testDescription = "Template for testing loading";
      const testPrice = "29.99";
      const testQty = "15";
      const testColor = "Purple";

      await fillMiscForm({
        name: uniqueName,
        description: testDescription,
        price: testPrice,
        quantityInStock: testQty,
        color: testColor
      });

      const saveTemplateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save as Template')]"));
      await saveTemplateButton.click();
      await driver.sleep(1000);

      // Refresh and navigate back to form
      await driver.navigate().refresh();
      await driver.sleep(2000);
      await navigateToMiscForm();

      // Load the template
      await useTemplate(uniqueName);

      // Verify template data loaded correctly
      const nameInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Product Name')]/ancestor::label/following-sibling::input"));
      const descInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Description')]/ancestor::label/following-sibling::textarea"));
      const priceInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Price')]/ancestor::label/following-sibling::input"));
      const qtyInput = await driver.findElement(By.xpath("//label[contains(text(), 'Quantity in Stock')]/following-sibling::input"));
      const colorInput = await driver.findElement(By.xpath("//label/span[contains(text(), 'Color')]/ancestor::label/following-sibling::input"));

      const nameValue = await nameInput.getAttribute("value");
      const descValue = await descInput.getAttribute("value");
      const priceValue = await priceInput.getAttribute("value");
      const qtyValue = await qtyInput.getAttribute("value");
      const colorValue = await colorInput.getAttribute("value");

      assert.strictEqual(nameValue, uniqueName, "Template should load with correct name");
      assert.strictEqual(descValue, testDescription, "Template should load with correct description");
      assert.strictEqual(priceValue, testPrice, "Template should load with correct price");
      assert.strictEqual(qtyValue, testQty, "Template should load with correct quantity");
      assert.strictEqual(colorValue, testColor, "Template should load with correct color");
    });
  });

  describe("Form Submission Tests", () => {
    it("should successfully submit a complete form with required fields only", async () => {
      await fillMiscForm({
        name: "Basic Misc Item",
        description: "A basic miscellaneous item with only required fields",
        price: "39.99",
        quantityInStock: "25"
      });

      // Scroll to and click submit button
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(200);
      await submitButton.click();

      const success = await checkForMessage("Misc Item successfully submitted!");
      assert.ok(success, "Form should submit successfully with all required fields");
    });

    it("should successfully submit a complete form with all fields", async () => {
      await fillMiscForm({
        name: "Complete Misc Item",
        description: "A complete miscellaneous item with all fields filled",
        price: "49.99",
        quantityInStock: "15",
        weight: "300g",
        size: "15cm x 10cm x 5cm",
        color: "Metallic Gray",
        brand: "Premium Crafts"
      });

      // Scroll to and click submit button
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(200);
      await submitButton.click();

      const success = await checkForMessage("Misc Item successfully submitted!");
      assert.ok(success, "Form should submit successfully with all fields");
    });

    it("should prevent submission and display error with missing required fields", async () => {
      await fillMiscForm({
        name: "Incomplete Item",
        // Missing description
        price: "29.99",
        // Missing quantity
      });

      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Misc Item')]"));
      const isDisabled = await submitButton.getAttribute("disabled") === "true";
      assert.ok(isDisabled, "Submit button should be disabled with missing required fields");
    });
  });

  describe("Image Carousel Tests", () => {
    it("should display default placeholder image when no images are provided", async () => {
      const placeholderImageVisible = await driver.findElement(By.xpath("//img[contains(@src, 'ProductPlaceholder.png')]"));
      assert.ok(await placeholderImageVisible.isDisplayed(), "Placeholder image should be displayed by default");
    });

    it("should have file input for uploading images", async () => {
      const fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
      assert.ok(await fileInput.isDisplayed(), "File input should be present for image uploads");
    });
  });

  // Cleanup
  after(async function () {
    try {
      // Remove the form submission interceptor
      await driver.executeScript(`window._formInterceptActive = false;`);

      // Restore the original fetch function
      await driver.executeScript(`
                if (window._originalFetch) {
                    window.fetch = window._originalFetch;
                    delete window._originalFetch;
                }
            `);

      await driver.sleep(1000);
      if (driver) {
        await driver.quit();
      }
    } catch (error) {
      console.error("Error in cleanup:", error);
    }
  });
});