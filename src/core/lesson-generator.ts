export interface LessonMetadata {
  title: string;
  system: string;
  course: string;
  lessonNumber: number;
  totalLessons: number;
  objectives?: string[];
}

export interface LessonExample {
  title: string;
  code: string;
  explanation: string;
  imagePath?: string;
  videoPath?: string;
}

export class LessonGenerator {
  generateMDX(metadata: LessonMetadata, examples: LessonExample[]): string {
    const frontmatter = this.generateFrontmatter(metadata);
    const content = this.generateContent(metadata, examples);

    return `${frontmatter}\n\n${content}`;
  }

  private generateFrontmatter(metadata: LessonMetadata): string {
    const objectives = metadata.objectives
      ? metadata.objectives.map(obj => `  - ${obj}`).join('\n')
      : '';

    return `---
layout: ../../../../layouts/LessonLayout.astro
title: "${metadata.title}"
game: "${metadata.course}"
system: "${metadata.system}"
lessonNumber: ${metadata.lessonNumber}
totalLessons: ${metadata.totalLessons}${objectives ? '\nobjectives:\n' + objectives : ''}
---`;
  }

  private generateContent(metadata: LessonMetadata, examples: LessonExample[]): string {
    let content = `## Lesson ${metadata.lessonNumber} – ${metadata.title}\n\n`;

    for (const example of examples) {
      content += `### ${example.title}\n\n`;
      content += '```basic\n';
      content += example.code;
      content += '\n```\n\n';
      content += example.explanation + '\n\n';

      if (example.imagePath) {
        content += `![Screenshot](${example.imagePath})\n\n`;
      }

      if (example.videoPath) {
        content += `<video src="${example.videoPath}" controls></video>\n\n`;
      }
    }

    return content;
  }
}
