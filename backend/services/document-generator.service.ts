import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export const generateDocx = (
    templateName: string,
    data: Record<string, unknown>
): Buffer => {
    const templatePath = path.join(
        process.cwd(),
        "templates",
        templateName
    );

    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    doc.render(data);

    return doc.toBuffer();
};
