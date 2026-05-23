import packageJson from "../package.json";

describe("project stack", () => {
  it("uses the modern Entregador stack", () => {
    expect(packageJson.dependencies.next).toContain("16");
    expect(packageJson.dependencies.react).toContain("19");
    expect(packageJson.dependencies["next-auth"]).toBeDefined();
    expect(packageJson.dependencies["@prisma/client"]).toBeDefined();
  });
});
