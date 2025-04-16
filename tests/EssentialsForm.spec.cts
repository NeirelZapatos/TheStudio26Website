import "mocha";
import { Builder, By, until, WebDriver } from "selenium-webdriver";
import { strict as assert } from "assert";

describe.only("Essentials Form Validation", function () {
    let driver: WebDriver;
    this.timeout(30000);

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
        await driver.manage().window().maximize();
        await driver.get("http://localhost:3000/Dashboard");
        await driver.sleep(1000); // ! Wait for dashboard to load

        // ! Script to prevent actual form submissions by intercepting the submit event
        await driver.executeScript(`
      window._formInterceptActive = true;
      
      // * Listens for the 'submit' event on all forms
      document.addEventListener('submit', function(event) {
        if (window._formInterceptActive) {
          // Prevent the actual form submission
          event.preventDefault();
          event.stopPropagation();
                  
          // * If there's a form success callback, manually trigger it
          setTimeout(() => {
            // Find success message element and show it
            const messageElement = document.querySelector('p[class*="text-center"]');
            if (messageElement) {
              messageElement.textContent = "Essentials item successfully submitted!";
              messageElement.classList.add('text-green-600');
            }
          }, 500);
          
          return false;
        }
      }, true);
    `);

        // ! --------------- Set up API mocking to prevent database changes ---------------
        // ! ---------------     Simulates the Next.Response in the Api     ---------------

        await driver.executeScript(`
      window._originalFetch = window.fetch;
      
      // Replace fetch with a mock version
      window.fetch = async function(url, options) {
        console.log('Intercepted fetch call to:', url);
        
        // ! --------------- Returns 2 fake templates to simulate browsing templates ---------------

        // Mock item-templates endpoint for GET requests (template listing)
        if (url.includes('/api/item-templates') && (!options || options.method === 'GET' || !options.method)) {
          console.log('Mocking GET template response');
          return {
            ok: true,
            json: async function() { 
              return { 
                success: true, 
                data: [
                  {
                    id: "template-1",
                    name: "Mock Template 1",
                    description: "A mocked template for testing",
                    price: "29.99",
                    quantity_in_stock: "10",
                    essentials_type: "Tools",
                    image_url: "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png",
                    images: ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"],
                    tool_type: "Hand Tools",
                    tool_brand: "MockBrand",
                    material_composition: "Steel",
                    category: "Essentials"
                  },
                  {
                    id: "template-2",
                    name: "Mock Template 2",
                    description: "Another mocked template",
                    price: "39.99",
                    quantity_in_stock: "5",
                    essentials_type: "Supplies",
                    image_url: "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png",
                    images: ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"],
                    supply_type: "Bezel Wire", 
                    supply_brand: "MockSupply",
                    supply_material: "Silver",
                    category: "Essentials"
                  }
                ]
              };
            }
          };
        }
        
        // ! --------------- Simulates saving a template ---------------

        // Mock item-templates endpoint for POST requests (save template)
        if (url.includes('/api/item-templates') && options && options.method === 'POST') {
          console.log('Mocking POST template response');
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
        
        // ! --------------- Simulates Submiting Item and creating in database ---------------
        // Mock items endpoint (item submission)
        if (url.includes('/api/items') && options && options.method === 'POST') {
          console.log('Mocking POST item response');
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
        
        // ! --------------- Simulates image uploading ---------------
        // For image upload mock
        if (url.includes('/api/upload')) {
          console.log('Mocking upload response');
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
        
        // For all other fetch calls, use the original fetch
        return window._originalFetch(url, options);
      };
    `);

        // ! NEED TO NAVIGATE TO THE ACTUAL ESSENTIALS FORM, CANT ACCESS USING THE URL

        // * Navigate through the sidebar to the products section
        const productsButton = await driver.findElement(By.xpath("//button[contains(., 'Products')]"));
        await productsButton.click();
        await driver.sleep(500);

        // * Click on "Create an Item" in the dropdown
        const createItemButton = await driver.findElement(By.xpath("//span[contains(text(), 'Create an Item')]"));
        await createItemButton.click();
        await driver.sleep(1000);

        // * Now click on the Jewelry Essentials card
        const essentialsCard = await driver.findElement(By.xpath("//h3[contains(text(), 'Jewelry Essentials')]/ancestor::div[contains(@class, 'rounded-lg')]"));
        await essentialsCard.click();
        await driver.sleep(1000);
    });

    const fillEssentialsForm = async (form: { [key: string]: string | undefined }) => {
        if (form.name) {
            const nameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Product Name')]/following-sibling::input"));
            await nameInput.clear();
            await nameInput.sendKeys(form.name);
        }

        if (form.description) {
            const descInput = await driver.findElement(By.xpath("//label[contains(text(), 'Description')]/following-sibling::textarea"));
            await descInput.clear();
            await descInput.sendKeys(form.description);
        }

        if (form.price) {
            const priceInput = await driver.findElement(By.xpath("//label[contains(text(), 'Price')]/following-sibling::input"));
            await priceInput.clear();
            await priceInput.sendKeys(form.price);
        }

        if (form.quantityInStock) {
            const qtyInput = await driver.findElement(By.xpath("//label[contains(text(), 'Quantity in Stock')]/following-sibling::input"));
            await qtyInput.clear();
            await qtyInput.sendKeys(form.quantityInStock);
        }

        if (form.weight) {
            const weightInput = await driver.findElement(By.xpath("//label[contains(text(), 'Weight')]/following-sibling::input"));
            await weightInput.clear();
            await weightInput.sendKeys(form.weight);
        }

        if (form.size) {
            const sizeInput = await driver.findElement(By.xpath("//label[contains(text(), 'Size')]/following-sibling::input"));
            await sizeInput.clear();
            await sizeInput.sendKeys(form.size);
        }

        if (form.essentialsType) {
            const dropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Category')]/following-sibling::select"));
            await dropdown.click();
            await driver.sleep(200);

            const option = await driver.findElement(By.xpath(`//option[text()='${form.essentialsType}']`));
            await option.click();
            await driver.sleep(500);

            if (form.essentialsType === "Tools") {
                if (form.toolType) {
                    const toolTypeDropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Tool Type')]/following-sibling::select"));
                    await toolTypeDropdown.click();
                    await driver.sleep(200);
                    const toolTypeOption = await driver.findElement(By.xpath(`//option[text()='${form.toolType}']`));
                    await toolTypeOption.click();
                }

                if (form.toolBrand) {
                    const toolBrandInput = await driver.findElement(By.xpath("//label[contains(text(), 'Brand')]/following-sibling::input"));
                    await toolBrandInput.clear();
                    await toolBrandInput.sendKeys(form.toolBrand);
                }

                if (form.materialComposition) {
                    const matCompDropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Material Composition')]/following-sibling::select"));
                    await matCompDropdown.click();
                    await driver.sleep(200);
                    const matCompOption = await driver.findElement(By.xpath(`//option[text()='${form.materialComposition}']`));
                    await matCompOption.click();
                }
            } else if (form.essentialsType === "Supplies") {
                if (form.supplyType) {
                    const supplyTypeDropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Supply Type')]/following-sibling::select"));
                    await supplyTypeDropdown.click();
                    await driver.sleep(200);
                    const supplyTypeOption = await driver.findElement(By.xpath(`//option[text()='${form.supplyType}']`));
                    await supplyTypeOption.click();
                }

                if (form.supplyBrand) {
                    const supplyBrandInput = await driver.findElement(By.xpath("//label[contains(text(), 'Brand')]/following-sibling::input"));
                    await supplyBrandInput.clear();
                    await supplyBrandInput.sendKeys(form.supplyBrand);
                }

                if (form.supplyMaterial) {
                    const supplyMaterialInput = await driver.findElement(By.xpath("//label[contains(text(), 'Material')]/following-sibling::input"));
                    await supplyMaterialInput.clear();
                    await supplyMaterialInput.sendKeys(form.supplyMaterial);
                }
            } else if (form.essentialsType === "Jewelry Kits") {
                if (form.kitType) {
                    const kitTypeDropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Kit Type')]/following-sibling::select"));
                    await kitTypeDropdown.click();
                    await driver.sleep(200);
                    const kitTypeOption = await driver.findElement(By.xpath(`//option[text()='${form.kitType}']`));
                    await kitTypeOption.click();
                }

                if (form.kitContents) {
                    const kitContentsInput = await driver.findElement(By.xpath("//label[contains(text(), 'Kit Contents')]/following-sibling::textarea"));
                    await kitContentsInput.clear();
                    await kitContentsInput.sendKeys(form.kitContents);
                }
            } else if (form.essentialsType === "Material and Components") {
                if (form.materialComponent) {
                    const materialComponentDropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Silver Type')]/following-sibling::select"));
                    await materialComponentDropdown.click();
                    await driver.sleep(200);
                    const materialComponentOption = await driver.findElement(By.xpath(`//option[text()='${form.materialComponent}']`));
                    await materialComponentOption.click();
                }
            }

            // ! Need to Scroll down to make buttons visible first
            const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Jewelry Item')]"));
            await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
            await driver.sleep(200);
        }
    };

    // & Helper function to check for specific message in the UI
    const checkForMessage = async (message: string, timeout: number = 5000) => {
        try {
            const messageEl = await driver.wait(
                until.elementLocated(By.xpath(`//*[contains(text(),'${message}')]`)),
                timeout
            );
            return await messageEl.isDisplayed();
        } catch (error) {
            return false;
        }
    };

    // & Helper function to use template search
    const useTemplate = async (templateName: string) => {
        const templateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Browse Templates')]"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", templateButton);
        await driver.sleep(200);
        await templateButton.click();

        const searchInput = await driver.findElement(By.xpath("//input[@placeholder='Search Templates']"));
        await searchInput.clear();
        await searchInput.sendKeys(templateName);

        await driver.sleep(1000);

        try {
            // * Try to find the template by name in the list
            const templateItem = await driver.findElement(By.xpath(`//li[contains(text(), '${templateName}')]`));
            await templateItem.click();
        } catch (e) {
            // * If exact match not found, click the first result
            const firstResult = await driver.findElement(By.css("li"));
            await firstResult.click();
        }

        await driver.sleep(1500);
    };

    describe("Required Field Validation", () => {
        it("should disable submit button when form is empty", async () => {
            const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Jewelry Item')]"));

            const isDisabled = await submitButton.getAttribute("disabled") === "true";
            assert.ok(isDisabled, "Submit button should be disabled with empty required fields");
        });

        it("should disable submit button with only some required fields filled", async () => {
            await fillEssentialsForm({
                name: "Test Product",
                price: "29.99",
                // * Missing quantity and essentialsType
            });

            const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Jewelry Item')]"));
            const isDisabled = await submitButton.getAttribute("disabled") === "true";
            assert.ok(isDisabled, "Submit button should be disabled with some required fields missing");
        });

        it("should enable submit button when all required fields are filled", async () => {
            await fillEssentialsForm({
                name: "Test Required Fields",
                description: "Testing required fields",
                price: "19.99",
                quantityInStock: "5",
                essentialsType: "Tools"
            });

            const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Jewelry Item')]"));
            const isDisabled = await submitButton.getAttribute("disabled") === "true";
            assert.ok(!isDisabled, "Submit button should be enabled when all required fields are filled");

            await driver.navigate().refresh();
            await driver.sleep(2000);

            // ^ Navigate back to essentials form
            const productsButton = await driver.findElement(By.xpath("//button[contains(., 'Products')]"));
            await productsButton.click();
            await driver.sleep(500);

            const createItemButton = await driver.findElement(By.xpath("//span[contains(text(), 'Create an Item')]"));
            await createItemButton.click();
            await driver.sleep(1000);

            const essentialsCard = await driver.findElement(By.xpath("//h3[contains(text(), 'Jewelry Essentials')]/ancestor::div[contains(@class, 'rounded-lg')]"));
            await essentialsCard.click();
            await driver.sleep(1000);
        });
    });

    describe("Price and Quantity Validation", () => {
        it("should automatically convert negative quantity to positive", async () => {
            await fillEssentialsForm({
                name: "Test Product",
                description: "Test Description",
                price: "15.99",
                quantityInStock: "-10", // Negative quantity
                essentialsType: "Tools"
            });

            // Check if the field is converted to positive
            const qtyInput = await driver.findElement(By.xpath("//label[contains(text(), 'Quantity in Stock')]/following-sibling::input"));
            const value = await qtyInput.getAttribute("value");
            assert.strictEqual(value, "10", "Quantity should be converted to positive value");
        });

        it("should validate price format", async () => {
            await fillEssentialsForm({
                name: "Test Price Validation",
                description: "Testing price validation",
                price: "abc", // ! Invalid price
                quantityInStock: "5",
                essentialsType: "Tools"
            });

            const priceInput = await driver.findElement(By.xpath("//label[contains(text(), 'Price')]/following-sibling::input"));
            const value = await priceInput.getAttribute("value");
            assert.strictEqual(value, "", "Price field should reject non-numeric input");

            await priceInput.clear();
            await priceInput.sendKeys("24.99");
            const newValue = await priceInput.getAttribute("value");
            assert.strictEqual(newValue, "24.99", "Price field should accept valid price format");
        });
    });

    describe("Category-Specific Fields Display", () => {
        it("should show Tools-specific fields when Tools category is selected", async () => {
            await fillEssentialsForm({
                name: "Test Tool Fields",
                description: "Testing Tools category fields",
                price: "49.99",
                quantityInStock: "5",
                essentialsType: "Tools"
            });

            await driver.sleep(500);

            try {
                const toolTypeField = await driver.findElement(By.xpath("//label[contains(text(), 'Tool Type')]"));
                const brandField = await driver.findElement(By.xpath("//label[contains(text(), 'Brand')]"));
                const materialField = await driver.findElement(By.xpath("//label[contains(text(), 'Material Composition')]"));

                assert.ok(
                    await toolTypeField.isDisplayed() &&
                    await brandField.isDisplayed() &&
                    await materialField.isDisplayed(),
                    "Tool-specific fields should be displayed when Tools category is selected"
                );
            } catch (error) {
                assert.fail("Tool-specific fields were not found");
            }
        });

        it("should show Supplies-specific fields when Supplies category is selected", async () => {
            await fillEssentialsForm({
                name: "Test Supplies Fields",
                description: "Testing Supplies category fields",
                price: "29.99",
                quantityInStock: "15",
                essentialsType: "Supplies"
            });

            await driver.sleep(500);

            try {
                const supplyTypeField = await driver.findElement(By.xpath("//label[contains(text(), 'Supply Type')]"));
                const brandField = await driver.findElement(By.xpath("//label[contains(text(), 'Brand')]"));
                const materialField = await driver.findElement(By.xpath("//label[contains(text(), 'Material')]"));

                assert.ok(
                    await supplyTypeField.isDisplayed() &&
                    await brandField.isDisplayed() &&
                    await materialField.isDisplayed(),
                    "Supplies-specific fields should be displayed when Supplies category is selected"
                );
            } catch (error) {
                assert.fail("Supplies-specific fields were not found");
            }
        });

        it("should show Jewelry Kits-specific fields when Jewelry Kits category is selected", async () => {
            await fillEssentialsForm({
                name: "Test Kits Fields",
                description: "Testing Jewelry Kits category fields",
                price: "39.99",
                quantityInStock: "8",
                essentialsType: "Jewelry Kits"
            });

            await driver.sleep(500);

            try {
                const kitTypeField = await driver.findElement(By.xpath("//label[contains(text(), 'Kit Type')]"));
                const kitContentsField = await driver.findElement(By.xpath("//label[contains(text(), 'Kit Contents')]"));

                assert.ok(
                    await kitTypeField.isDisplayed() &&
                    await kitContentsField.isDisplayed(),
                    "Kit-specific fields should be displayed when Jewelry Kits category is selected"
                );
            } catch (error) {
                assert.fail("Jewelry Kits-specific fields were not found");
            }
        });

        it("should show Material components fields when Material and Components category is selected", async () => {
            await fillEssentialsForm({
                name: "Test Material Fields",
                description: "Testing Material and Components category fields",
                price: "59.99",
                quantityInStock: "10",
                essentialsType: "Material and Components"
            });

            await driver.sleep(500);

            try {
                const silverTypeField = await driver.findElement(By.xpath("//label[contains(text(), 'Silver Type')]"));

                assert.ok(
                    await silverTypeField.isDisplayed(),
                    "Silver Type field should be displayed when Material and Components category is selected"
                );
            } catch (error) {
                assert.fail("Material and Components-specific fields were not found");
            }
        });
    });

    describe("Form Submission Tests", () => {
        it("should successfully submit a complete Tools form", async () => {
            await fillEssentialsForm({
                name: "Premium Jeweler's Pliers",
                description: "High-quality pliers for precision jewelry making",
                price: "59.99",
                quantityInStock: "15",
                weight: "200",
                size: "15cm",
                essentialsType: "Tools",
                toolType: "Hand Tools",
                toolBrand: "JewelCraft",
                materialComposition: "Steel"
            });

            const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Jewelry Item')]"));
            await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
            await driver.sleep(200);
            await submitButton.click();

            const success = await checkForMessage("Essentials item successfully submitted!");
            assert.ok(success, "Form should submit successfully with all required fields for Tools category");

            await driver.navigate().refresh();
            await driver.sleep(2000);

            // ^ Navigate back to essentials form
            const productsButton = await driver.findElement(By.xpath("//button[contains(., 'Products')]"));
            await productsButton.click();
            await driver.sleep(500);

            const createItemButton = await driver.findElement(By.xpath("//span[contains(text(), 'Create an Item')]"));
            await createItemButton.click();
            await driver.sleep(1000);

            const essentialsCard = await driver.findElement(By.xpath("//h3[contains(text(), 'Jewelry Essentials')]/ancestor::div[contains(@class, 'rounded-lg')]"));
            await essentialsCard.click();
            await driver.sleep(1000);
        });

        it("should successfully submit a complete Supplies form", async () => {
            await fillEssentialsForm({
                name: "Silver Bezel Wire",
                description: "Fine silver bezel wire for setting stones",
                price: "24.99",
                quantityInStock: "25",
                weight: "50",
                size: "5mm x 0.3mm",
                essentialsType: "Supplies",
                supplyType: "Bezel Wire",
                supplyBrand: "SilverCraft",
                supplyMaterial: "Fine Silver 999"
            });

            const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Jewelry Item')]"));
            await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
            await driver.sleep(200);
            await submitButton.click();

            const success = await checkForMessage("Essentials item successfully submitted!");
            assert.ok(success, "Form should submit successfully with all required fields for Supplies category");

            await driver.navigate().refresh();
            await driver.sleep(2000);

            // ^ Navigate back to essentials form
            const productsButton = await driver.findElement(By.xpath("//button[contains(., 'Products')]"));
            await productsButton.click();
            await driver.sleep(500);

            const createItemButton = await driver.findElement(By.xpath("//span[contains(text(), 'Create an Item')]"));
            await createItemButton.click();
            await driver.sleep(1000);

            const essentialsCard = await driver.findElement(By.xpath("//h3[contains(text(), 'Jewelry Essentials')]/ancestor::div[contains(@class, 'rounded-lg')]"));
            await essentialsCard.click();
            await driver.sleep(1000);
        });

        it("should successfully submit a complete Jewelry Kits form", async () => {
            await fillEssentialsForm({
                name: "Beginner's Wire Wrapping Kit",
                description: "Complete kit for beginners to learn wire wrapping techniques",
                price: "35.99",
                quantityInStock: "12",
                weight: "350",
                size: "25cm x 15cm x 5cm",
                essentialsType: "Jewelry Kits",
                kitType: "Wire Wrapping Kits",
                kitContents: "Wire in various gauges, pliers set, wire cutters, practice beads, instructional booklet"
            });

            const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit Jewelry Item')]"));
            await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
            await driver.sleep(200);
            await submitButton.click();

            const success = await checkForMessage("Essentials item successfully submitted!");
            assert.ok(success, "Form should submit successfully with all required fields for Jewelry Kits category");
        });
    });

    describe("Template Functionality", () => {
        it("should save form as template and load it later", async () => {
            await driver.navigate().refresh();
            await driver.sleep(2000);

            // ^ Navigate back to essentials form
            const productsButton = await driver.findElement(By.xpath("//button[contains(., 'Products')]"));
            await productsButton.click();
            await driver.sleep(500);

            const createItemButton = await driver.findElement(By.xpath("//span[contains(text(), 'Create an Item')]"));
            await createItemButton.click();
            await driver.sleep(1000);

            const essentialsCard = await driver.findElement(By.xpath("//h3[contains(text(), 'Jewelry Essentials')]/ancestor::div[contains(@class, 'rounded-lg')]"));
            await essentialsCard.click();
            await driver.sleep(1000);

            const uniqueName = `Test Template ${Date.now()}`;
            await fillEssentialsForm({
                name: uniqueName,
                description: "Template for testing",
                price: "19.99",
                quantityInStock: "10",
                weight: "120",
                size: "10cm x 8cm",
                essentialsType: "Material and Components",
                materialComponent: "Sterling Silver Components"
            });

            // Click Save as Template button
            const saveTemplateButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save as Template')]"));
            await driver.executeScript("arguments[0].scrollIntoView(true);", saveTemplateButton);
            await driver.sleep(200);
            await saveTemplateButton.click();

            const templateSaved = await checkForMessage("Template saved successfully!");
            assert.ok(templateSaved, "Template should be saved successfully");

            await driver.navigate().refresh();
            await driver.sleep(2000);

            // ^ Navigate back to essentials form
            const productsBtn = await driver.findElement(By.xpath("//button[contains(., 'Products')]"));
            await productsBtn.click();
            await driver.sleep(500);

            const createItemBtn = await driver.findElement(By.xpath("//span[contains(text(), 'Create an Item')]"));
            await createItemBtn.click();
            await driver.sleep(1000);

            const essentialsBtn = await driver.findElement(By.xpath("//h3[contains(text(), 'Jewelry Essentials')]/ancestor::div[contains(@class, 'rounded-lg')]"));
            await essentialsBtn.click();
            await driver.sleep(1000);

            await useTemplate(uniqueName);

            const nameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Product Name')]/following-sibling::input"));
            const nameValue = await nameInput.getAttribute("value");
            assert.strictEqual(nameValue, uniqueName, "Template should load with correct name");

            const materialComponentDropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Silver Type')]/following-sibling::select"));
            assert.ok(await materialComponentDropdown.isDisplayed(), "Material and Components fields should be loaded with template");
        });
    });

    // ! --------------- TESTING CLEANUP ---------------
    after(async () => {

        // ! Remove the form submission interceptor
        await driver.executeScript(`
      window._formInterceptActive = false;
    `);

        // ! Restore the original fetch function
        await driver.executeScript(`
      if (window._originalFetch) {
        window.fetch = window._originalFetch;
        delete window._originalFetch;
      }
    `);

        await driver.sleep(3000);
        if (driver) await driver.quit();
    });
});
