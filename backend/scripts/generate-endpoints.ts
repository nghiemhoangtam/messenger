import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from '../src/app.module';

interface SwaggerParameter {
  in: string;
  name: string;
  type?: string;
  description?: string;
  required?: boolean;
  schema?: unknown;
}

interface SwaggerResponse {
  description: string;
  content?: Record<string, { example?: unknown; schema?: unknown }>;
}

interface MethodDetails {
  summary?: string;
  description?: string;
  parameters?: SwaggerParameter[];
  requestBody?: unknown;
  responses?: Record<string, SwaggerResponse>;
  tags?: string[];
  security?: Array<Record<string, string[]>>;
}

async function generateEndpoints(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('Comprehensive API Endpoints for the application')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication and user-related operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const paths = document.paths;

    let output = '# API Endpoints Documentation\n\n';
    output +=
      'This document provides a comprehensive overview of all API endpoints in the application.\n\n';
    output += `Generated automatically on ${new Date().toISOString()}.\n\n`;

    // Loop through the API paths
    for (const [path, methods] of Object.entries(paths)) {
      output += `## ${path}\n\n`;

      for (const [method, details] of Object.entries(methods)) {
        const methodDetails = details as MethodDetails;

        // Tiêu đề cho method
        output += `### ${method.toUpperCase()} ${path}\n\n`;

        // Tags
        if (methodDetails.tags?.length) {
          output += `- **Tags**: ${methodDetails.tags.join(', ')}\n`;
        }

        // Security (e.g., Bearer Auth)
        if (methodDetails.security?.length) {
          const authTypes = methodDetails.security
            .map((sec) => Object.keys(sec)[0])
            .join(', ');
          output += `- **Authentication**: ${authTypes}\n`;
        }

        // Summary và Description
        output += `- **Summary**: ${methodDetails.summary ?? 'No summary provided'}\n`;
        output += `- **Description**: ${methodDetails.description ?? 'No description provided'}\n`;

        // Parameters
        if (methodDetails.parameters?.length) {
          output += `\n#### Parameters\n\n`;
          output += '| Name | Type | In | Required | Description |\n';
          output += '|------|------|----|----------|-------------|\n';
          methodDetails.parameters.forEach((param) => {
            const paramType =
              (param.type ?? param.schema) ? 'object' : 'string';
            output += `| ${param.name} | ${paramType} | ${param.in} | ${param.required ? 'Yes' : 'No'} | ${param.description ?? 'No description'} |\n`;
          });
        }

        // Request Body
        if (methodDetails.requestBody) {
          output += `\n#### Request Body\n\n`;
          output += '```json\n';
          try {
            output += `${JSON.stringify(methodDetails.requestBody, null, 2) ?? '{}'}\n`;
          } catch {
            output += '{} // Invalid request body format\n';
          }
          output += '```\n';
        }

        // Responses
        if (methodDetails.responses) {
          output += `\n#### Responses\n\n`;
          for (const [status, response] of Object.entries(
            methodDetails.responses,
          )) {
            output += `- **${status}**: ${response.description}\n`;
            const jsonContent = response.content?.['application/json'];
            if (jsonContent?.example) {
              output += `  **Example Response**:\n`;
              output += '```json\n';
              try {
                output += `${JSON.stringify(jsonContent.example, null, 2)}\n`;
              } catch {
                output += '// Invalid JSON example\n';
              }
              output += '```\n';
            } else if (jsonContent?.schema) {
              output += `  **Schema**:\n`;
              output += '```json\n';
              try {
                output += `${JSON.stringify(jsonContent.schema, null, 2)}\n`;
              } catch {
                output += '// Invalid JSON schema\n';
              }
              output += '```\n';
            }
          }
        }

        output += '\n---\n';
      }
    }

    // Ghi file ENDPOINTS.md
    writeFileSync('ENDPOINTS.md', output, { encoding: 'utf8' });
    console.log(
      '✅ Endpoints documentation generated successfully at ENDPOINTS.md',
    );

    await app.close();
  } catch (error) {
    console.error('❌ Error generating endpoints documentation:', error);
    process.exit(1);
  }
}

generateEndpoints().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
