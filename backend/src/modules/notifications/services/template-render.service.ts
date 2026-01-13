import { Injectable } from '@nestjs/common';
import { compile, TemplateDelegate } from 'handlebars';
import { readFileSync } from 'fs';
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
      const templatePath = join(
        __dirname,
        '..',
        'templates',
        `${templateName}.hbs`,
      );
      const source = readFileSync(templatePath, 'utf8');
      this.cache[templateName] = compile(source);
    }

    return this.cache[templateName];
  }
}
