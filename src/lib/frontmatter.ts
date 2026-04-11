/**
 * Frontmatter — YAML frontmatter parsing, serialization, and CRUD commands
 */

import fs from 'fs';
import path from 'path';
import { safeReadFile, output, error, ensureInsidePlanejamento } from './core.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FrontmatterValue = string | string[] | boolean | number | Record<string, unknown> | null;
export type ParsedFrontmatter = Record<string, FrontmatterValue>;

export interface FrontmatterSchema {
  required: string[];
}

export type MustHavesItem = string | Record<string, string | number | string[]>;

// ─── Parsing engine ───────────────────────────────────────────────────────────

export function extractFrontmatter(content: string): ParsedFrontmatter {
  const frontmatter: ParsedFrontmatter = {};
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return frontmatter;

  const yaml = match[1];
  const lines = yaml.split('\n');

  interface StackFrame {
    obj: Record<string, unknown> | unknown[];
    key: string | null;
    indent: number;
  }

  const stack: StackFrame[] = [{ obj: frontmatter as Record<string, unknown>, key: null, indent: -1 }];

  for (const line of lines) {
    if (line.trim() === '') continue;

    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1];

    const keyMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):\s*(.*)/);
    if (keyMatch) {
      const key = keyMatch[2];
      const value = keyMatch[3].trim();

      if (value === '' || value === '[') {
        const newVal: Record<string, unknown> | unknown[] = value === '[' ? [] : {};
        (current.obj as Record<string, unknown>)[key] = newVal;
        current.key = null;
        stack.push({ obj: newVal, key: null, indent });
      } else if (value.startsWith('[') && value.endsWith(']')) {
        (current.obj as Record<string, unknown>)[key] = value
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        current.key = null;
      } else {
        (current.obj as Record<string, unknown>)[key] = value.replace(/^["']|["']$/g, '');
        current.key = null;
      }
    } else if (line.trim().startsWith('- ')) {
      const itemValue = line.trim().slice(2).replace(/^["']|["']$/g, '');

      if (typeof current.obj === 'object' && !Array.isArray(current.obj) && Object.keys(current.obj).length === 0) {
        const parent = stack.length > 1 ? stack[stack.length - 2] : null;
        if (parent) {
          for (const k of Object.keys(parent.obj as Record<string, unknown>)) {
            if ((parent.obj as Record<string, unknown>)[k] === current.obj) {
              const arr = [itemValue];
              (parent.obj as Record<string, unknown>)[k] = arr;
              current.obj = arr;
              break;
            }
          }
        }
      } else if (Array.isArray(current.obj)) {
        current.obj.push(itemValue);
      }
    }
  }

  return frontmatter;
}

export function reconstructFrontmatter(obj: ParsedFrontmatter): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else if (value.every(v => typeof v === 'string') && value.length <= 3 && (value as string[]).join(', ').length < 60) {
        lines.push(`${key}: [${(value as string[]).join(', ')}]`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${typeof item === 'string' && (item.includes(':') || item.includes('#')) ? `"${item}"` : item}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [subkey, subval] of Object.entries(value as Record<string, unknown>)) {
        if (subval === null || subval === undefined) continue;
        if (Array.isArray(subval)) {
          if (subval.length === 0) {
            lines.push(`  ${subkey}: []`);
          } else if (subval.every(v => typeof v === 'string') && subval.length <= 3 && (subval as string[]).join(', ').length < 60) {
            lines.push(`  ${subkey}: [${(subval as string[]).join(', ')}]`);
          } else {
            lines.push(`  ${subkey}:`);
            for (const item of subval) {
              lines.push(`    - ${typeof item === 'string' && (item.includes(':') || item.includes('#')) ? `"${item}"` : item}`);
            }
          }
        } else if (typeof subval === 'object') {
          lines.push(`  ${subkey}:`);
          for (const [subsubkey, subsubval] of Object.entries(subval as Record<string, unknown>)) {
            if (subsubval === null || subsubval === undefined) continue;
            if (Array.isArray(subsubval)) {
              if (subsubval.length === 0) {
                lines.push(`    ${subsubkey}: []`);
              } else {
                lines.push(`    ${subsubkey}:`);
                for (const item of subsubval) {
                  lines.push(`      - ${item}`);
                }
              }
            } else {
              lines.push(`    ${subsubkey}: ${subsubval}`);
            }
          }
        } else {
          const sv = String(subval);
          lines.push(`  ${subkey}: ${sv.includes(':') || sv.includes('#') ? `"${sv}"` : sv}`);
        }
      }
    } else {
      const sv = String(value);
      if (sv.includes(':') || sv.includes('#') || sv.startsWith('[') || sv.startsWith('{')) {
        lines.push(`${key}: "${sv}"`);
      } else {
        lines.push(`${key}: ${sv}`);
      }
    }
  }
  return lines.join('\n');
}

export function spliceFrontmatter(content: string, newObj: ParsedFrontmatter): string {
  const yamlStr = reconstructFrontmatter(newObj);
  const match = content.match(/^---\n[\s\S]+?\n---/);
  if (match) {
    return `---\n${yamlStr}\n---` + content.slice(match[0].length);
  }
  return `---\n${yamlStr}\n---\n\n` + content;
}

export function parseMustHavesBlock(content: string, blockName: string): MustHavesItem[] {
  const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
  if (!fmMatch) return [];

  const yaml = fmMatch[1];
  const blockPattern = new RegExp(`^\\s{4}${blockName}:\\s*$`, 'm');
  const blockStart = yaml.search(blockPattern);
  if (blockStart === -1) return [];

  const afterBlock = yaml.slice(blockStart);
  const blockLines = afterBlock.split('\n').slice(1);

  const items: MustHavesItem[] = [];
  let current: MustHavesItem | null = null;

  for (const line of blockLines) {
    if (line.trim() === '') continue;
    const indent = (line.match(/^(\s*)/)?.[1] ?? '').length;
    if (indent <= 4 && line.trim() !== '') break;

    if (line.match(/^\s{6}-\s+/)) {
      if (current) items.push(current);
      current = {};
      const simpleMatch = line.match(/^\s{6}-\s+"?([^"]+)"?\s*$/);
      if (simpleMatch && !line.includes(':')) {
        current = simpleMatch[1];
      } else {
        const kvMatch = line.match(/^\s{6}-\s+(\w+):\s*"?([^"]*)"?\s*$/);
        if (kvMatch) {
          current = {};
          (current as Record<string, string>)[kvMatch[1]] = kvMatch[2];
        }
      }
    } else if (current && typeof current === 'object') {
      const obj = current as Record<string, string | number | string[]>;
      const kvMatch = line.match(/^\s{8,}(\w+):\s*"?([^"]*)"?\s*$/);
      if (kvMatch) {
        const val = kvMatch[2];
        obj[kvMatch[1]] = /^\d+$/.test(val) ? parseInt(val, 10) : val;
      }
      const arrMatch = line.match(/^\s{10,}-\s+"?([^"]+)"?\s*$/);
      if (arrMatch) {
        const keys = Object.keys(obj);
        const lastKey = keys[keys.length - 1];
        if (lastKey && !Array.isArray(obj[lastKey])) {
          obj[lastKey] = obj[lastKey] ? [String(obj[lastKey])] : [];
        }
        if (lastKey) (obj[lastKey] as string[]).push(arrMatch[1]);
      }
    }
  }
  if (current) items.push(current);

  return items;
}

// ─── Frontmatter CRUD commands ────────────────────────────────────────────────

export const FRONTMATTER_SCHEMAS: Record<string, FrontmatterSchema> = {
  plan:         { required: ['etapa', 'plan', 'type', 'etapa', 'depends_on', 'files_modified', 'autonomous', 'must_haves'] },
  summary:      { required: ['etapa', 'plan', 'subsystem', 'tags', 'duration', 'completed'] },
  verification: { required: ['etapa', 'verified', 'status', 'score'] },
};

export function cmdFrontmatterGet(cwd: string, filePath: string, field: string | undefined, raw: boolean): void {
  if (!filePath) { error('caminho do arquivo obrigatório'); }
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  const content = safeReadFile(fullPath);
  if (!content) { output({ error: 'Arquivo não encontrado', path: filePath }, raw); return; }
  const fm = extractFrontmatter(content);
  if (field) {
    const value = fm[field];
    if (value === undefined) { output({ error: 'Campo não encontrado', field }, raw); return; }
    output({ [field]: value }, raw, JSON.stringify(value));
  } else {
    output(fm, raw);
  }
}

export function cmdFrontmatterSet(cwd: string, filePath: string, field: string | undefined, value: string | undefined, raw: boolean): void {
  if (!filePath || !field || value === undefined) { error('arquivo, campo e valor obrigatórios'); }
  try {
    const fullPath = ensureInsidePlanejamento(cwd, filePath, 'frontmatter set');
    if (!fs.existsSync(fullPath)) { output({ error: 'Arquivo não encontrado', path: filePath }, raw); return; }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = extractFrontmatter(content);
    let parsedValue: unknown;
    try { parsedValue = JSON.parse(value); } catch { parsedValue = value; }
    fm[field] = parsedValue as FrontmatterValue;
    const newContent = spliceFrontmatter(content, fm);
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    output({ updated: true, field, value: parsedValue }, raw, 'true');
  } catch (err) {
    output({ error: (err as Error).message }, raw);
  }
}

export function cmdFrontmatterMerge(cwd: string, filePath: string, data: string | undefined, raw: boolean): void {
  if (!filePath || !data) { error('arquivo e dados obrigatórios'); }
  try {
    const fullPath = ensureInsidePlanejamento(cwd, filePath, 'frontmatter merge');
    if (!fs.existsSync(fullPath)) { output({ error: 'Arquivo não encontrado', path: filePath }, raw); return; }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = extractFrontmatter(content);
    let mergeData: ParsedFrontmatter;
    try { mergeData = JSON.parse(data) as ParsedFrontmatter; } catch { error('JSON inválido para --data'); return; }
    Object.assign(fm, mergeData);
    const newContent = spliceFrontmatter(content, fm);
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    output({ merged: true, fields: Object.keys(mergeData) }, raw, 'true');
  } catch (err) {
    output({ error: (err as Error).message }, raw);
  }
}

export function cmdFrontmatterValidate(cwd: string, filePath: string, schemaName: string | undefined, raw: boolean): void {
  if (!filePath || !schemaName) { error('arquivo e esquema obrigatórios'); }
  const schema = FRONTMATTER_SCHEMAS[schemaName];
  if (!schema) { error(`Esquema desconhecido: ${schemaName}. Disponíveis: ${Object.keys(FRONTMATTER_SCHEMAS).join(', ')}`); }
  try {
    const fullPath = ensureInsidePlanejamento(cwd, filePath, 'frontmatter validate');
    const content = safeReadFile(fullPath);
    if (!content) { output({ error: 'Arquivo não encontrado', path: filePath }, raw); return; }
    const fm = extractFrontmatter(content);
    const missing = schema.required.filter(f => fm[f] === undefined);
    const present = schema.required.filter(f => fm[f] !== undefined);
    output({ valid: missing.length === 0, missing, present, schema: schemaName }, raw, missing.length === 0 ? 'valid' : 'invalid');
  } catch (err) {
    output({ error: (err as Error).message }, raw);
  }
}
