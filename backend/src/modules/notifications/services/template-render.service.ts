import { Injectable } from '@nestjs/common';
import { compile, TemplateDelegate } from 'handlebars';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type TemplateCache = Record<string, TemplateDelegate>;

@Injectable()
export class TemplateRenderService {
  private readonly cache: TemplateCache = {};

  /**
   * Public API
   * Render a handlebars template with given context
   */
  public render(templateName: string, context: Record<string, any>): string {
    const template = this.getOrLoadTemplate(templateName);
    return template(context);
  }

  /**
   * Internal cache loader
   */
  private getOrLoadTemplate(templateName: string): TemplateDelegate {
    if (!this.cache[templateName]) {
      const cwd = process.cwd();

      // Try multiple possible paths
      const possiblePaths = [
        // Production build (dist)
        join(cwd, 'dist', 'modules', 'notifications', 'templates', `${templateName}.hbs`),
        // Development (src)
        join(cwd, 'src', 'modules', 'notifications', 'templates', `${templateName}.hbs`),
        // Alternative: relative to current file location
        join(__dirname, '..', 'templates', `${templateName}.hbs`),
      ];

      let templatePath: string | null = null;
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          templatePath = path;
          break;
        }
      }

      if (!templatePath) {
        const errorMsg = `Template "${templateName}.hbs" not found. Tried paths:\n${possiblePaths.join('\n')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const source = readFileSync(templatePath, 'utf8');
      this.cache[templateName] = compile(source);
    }

    return this.cache[templateName];
  }
}
