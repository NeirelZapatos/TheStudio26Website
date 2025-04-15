import "mocha";
import { Builder, By, until, WebDriver } from "selenium-webdriver";
import { strict as assert } from "assert";

// Home Page Tests for The Studio 26
// This test suite verifies the functionality of the home page as defined in the Next.js page.

describe("Home Page Tests", function () {
  let driver: WebDriver;

  // Increase timeout if necessary
  this.timeout(30000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
  });

  it("should display correct header with title and address", async () => {
    await driver.get("http://localhost:3000");

    // Locate the header element and verify the main title
    const headerElement = await driver.findElement(By.css("header"));
    const h1Text = await headerElement.findElement(By.css("h1")).getText();
    assert.equal(h1Text, "The Studio 26", "Header title mismatch");

    // Verify the address text
    const addressText = await headerElement.findElement(By.css("p")).getText();
    assert.equal(addressText, "4100 Cameron Park Drive #118, Cameron Park, CA 95682", "Address text mismatch");
  });

  it("should display the projects section with default title when none is provided", async () => {
    await driver.get("http://localhost:3000");

    // Look for the default projects section title
    const defaultTitle = "Past Projects Created At The Studio 26, LLC";
    const projectsSectionTitle = await driver.findElement(By.xpath(`//*[contains(text(), '${defaultTitle}')]`));
    assert.ok(projectsSectionTitle, "Projects section default title not found");
  });

  it("should display at least one project image with correct alt text", async () => {
    await driver.get("http://localhost:3000");
    
    // Wait for at least one project image to be present
    const imageElement = await driver.wait(until.elementLocated(By.css("img[alt^='Project Image']")), 5000);
    const altText = await imageElement.getAttribute("alt");
    assert.ok(altText && altText.includes("Project Image"), "Project image not found or alt text mismatch");
  });

  it("should display a call-to-action button in the jewelry section", async () => {
    await driver.get("http://localhost:3000");

    // Locate the jewelry section button using its container's class
    const button = await driver.findElement(By.css("section.border-t button"));
    assert.ok(button, "Call-to-action button not found");
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });
});