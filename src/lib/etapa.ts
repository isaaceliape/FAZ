/**
 * Etapa — Etapa CRUD, query, and lifecycle operations
 */

import fs from 'fs';
import path from 'path';
import {
  escapeRegex,
  normalizeEtapaNome,
  compareEtapaNum,
  findEtapaInternal,
  getArchivedEtapasDirs,
  generateSlugInternal,
  getMilestoneEtapaFilter,
  toPosixPath,
  output,
  error,
} from './core.js';
import { extractFrontmatter } from './frontmatter.js';
import { writeStateMd } from './state.js';

interface EtapasListOptions {
  type?: string;
  phase?: string;
  includeArchived?: boolean;
}

export function cmdEtapasList(cwd: string, options: EtapasListOptions, raw: boolean): void {
  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const { type, phase, includeArchived } = options;

  if (!fs.existsSync(etapasDir)) {
    if (type) {
      output({ files: [], count: 0 }, raw, '');
    } else {
      output({ directories: [], count: 0 }, raw, '');
    }
    return;
  }

  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    let dirs = entries.filter((e: fs.Dirent) => e.isDirectory()).map((e: fs.Dirent) => e.name);

    if (includeArchived) {
      const archived = getArchivedEtapasDirs(cwd);
      for (const a of archived) {
        dirs.push(`${a.name} [${a.milestone}]`);
      }
    }

    dirs.sort((a: string, b: string) => compareEtapaNum(a, b));

    if (phase) {
      const normalized = normalizeEtapaNome(phase);
      const match = dirs.find((d: string) => d.startsWith(normalized));
      if (!match) {
        output({ files: [], count: 0, phase_dir: null, error: 'Fase não encontrada' }, raw, '');
        return;
      }
      dirs = [match];
    }

    if (type) {
      const files: string[] = [];
      for (const dir of dirs) {
        const dirPath = path.join(etapasDir, dir);
        const dirFiles = fs.readdirSync(dirPath);

        let filtered: string[];
        if (type === 'plans') {
          filtered = dirFiles.filter((f: string) => f.endsWith('-PLAN.md') || f === 'PLAN.md');
        } else if (type === 'summaries') {
          filtered = dirFiles.filter(
            (f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md'
          );
        } else {
          filtered = dirFiles;
        }

        files.push(...filtered.sort());
      }

      const result = {
        files,
        count: files.length,
        phase_dir: phase ? dirs[0].replace(/^\d+(?:\.\d+)*-?/, '') : null,
      };
      output(result, raw, files.join('\n'));
      return;
    }

    output({ directories: dirs, count: dirs.length }, raw, dirs.join('\n'));
  } catch (e) {
    error('Falha ao listar fases: ' + (e as Error).message);
  }
}

export function cmdEtapaNextDecimal(cwd: string, basePhase: string, raw: boolean): void {
  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const normalized = normalizeEtapaNome(basePhase);

  if (!fs.existsSync(etapasDir)) {
    output(
      { found: false, base_phase: normalized, next: `${normalized}.1`, existing: [] },
      raw,
      `${normalized}.1`
    );
    return;
  }

  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    const dirs = entries.filter((e: fs.Dirent) => e.isDirectory()).map((e: fs.Dirent) => e.name);

    const baseExists = dirs.some((d: string) => d.startsWith(normalized + '-') || d === normalized);

    const decimalPattern = new RegExp(`^${normalized}\\.(\\d+)`);
    const existingDecimals: string[] = [];

    for (const dir of dirs) {
      const match = dir.match(decimalPattern);
      if (match) {
        existingDecimals.push(`${normalized}.${match[1]}`);
      }
    }

    existingDecimals.sort((a: string, b: string) => compareEtapaNum(a, b));

    let nextDecimal: string;
    if (existingDecimals.length === 0) {
      nextDecimal = `${normalized}.1`;
    } else {
      const lastDecimal = existingDecimals[existingDecimals.length - 1];
      const lastNum = parseInt(lastDecimal.split('.')[1], 10);
      nextDecimal = `${normalized}.${lastNum + 1}`;
    }

    output(
      { found: baseExists, base_phase: normalized, next: nextDecimal, existing: existingDecimals },
      raw,
      nextDecimal
    );
  } catch (e) {
    error('Falha ao calcular próxima etapa decimal: ' + (e as Error).message);
  }
}

export function cmdFindEtapa(cwd: string, etapa: string, raw: boolean): void {
  if (!etapa) {
    error('identificador de fase obrigatório');
  }

  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const normalized = normalizeEtapaNome(etapa);

  const notFound = {
    found: false,
    directory: null,
    phase_number: null,
    phase_name: null,
    plans: [],
    summaries: [],
  };

  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    const dirs = entries
      .filter((e: fs.Dirent) => e.isDirectory())
      .map((e: fs.Dirent) => e.name)
      .sort((a: string, b: string) => compareEtapaNum(a, b));

    const match = dirs.find((d: string) => d.startsWith(normalized));
    if (!match) {
      output(notFound, raw, '');
      return;
    }

    const dirMatch = match.match(/^(\d+[A-Z]?(?:\.\d+)*)-?(.*)/i);
    const etapaNumber = dirMatch ? dirMatch[1] : normalized;
    const etapaNome = dirMatch && dirMatch[2] ? dirMatch[2] : null;

    const phaseDir = path.join(etapasDir, match);
    const phaseFiles = fs.readdirSync(phaseDir);
    const plans = phaseFiles
      .filter((f: string) => f.endsWith('-PLAN.md') || f === 'PLAN.md')
      .sort();
    const summaries = phaseFiles
      .filter((f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md')
      .sort();

    const result = {
      found: true,
      directory: toPosixPath(path.join('.fase-ai', 'etapas', match)),
      phase_number: etapaNumber,
      phase_name: etapaNome,
      plans,
      summaries,
    };

    output(result, raw, result.directory);
  } catch {
    output(notFound, raw, '');
  }
}

function extractObjective(content: string): string | null {
  const m = content.match(/<objective>\s*\n?\s*(.+)/);
  return m ? m[1].trim() : null;
}

export function cmdEtapaPlanIndex(cwd: string, phase: string, raw: boolean): void {
  if (!phase) {
    error('fase obrigatória para phase-plan-index');
  }

  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const normalized = normalizeEtapaNome(phase);

  let phaseDir: string | null = null;
  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    const dirs = entries
      .filter((e: fs.Dirent) => e.isDirectory())
      .map((e: fs.Dirent) => e.name)
      .sort((a: string, b: string) => compareEtapaNum(a, b));
    const match = dirs.find((d: string) => d.startsWith(normalized));
    if (match) {
      phaseDir = path.join(etapasDir, match);
    }
  } catch {
    // phases dir doesn't exist
  }

  if (!phaseDir) {
    output(
      {
        phase: normalized,
        error: 'Fase não encontrada',
        plans: [],
        etapas: {},
        incomplete: [],
        has_checkpoints: false,
      },
      raw
    );
    return;
  }

  const phaseFiles = fs.readdirSync(phaseDir);
  const planFiles = phaseFiles
    .filter((f: string) => f.endsWith('-PLAN.md') || f === 'PLAN.md')
    .sort();
  const summaryFiles = phaseFiles.filter(
    (f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md'
  );

  const completedPlanIds = new Set(
    summaryFiles.map((s: string) => s.replace('-SUMMARY.md', '').replace('SUMMARY.md', ''))
  );

  const plans: {
    id: string;
    etapa: number;
    autonomous: boolean;
    objective: string | null;
    files_modified: string[];
    task_count: number;
    has_summary: boolean;
  }[] = [];
  const etapas: Record<string, string[]> = {};
  const incomplete: string[] = [];
  let hasCheckpoints = false;

  for (const planFile of planFiles) {
    const planId = planFile.replace('-PLAN.md', '').replace('PLAN.md', '');
    const planPath = path.join(phaseDir, planFile);
    const content = fs.readFileSync(planPath, 'utf-8');
    const fm = extractFrontmatter(content);

    const xmlTasks = content.match(/<task[\s>]/gi) || [];
    const mdTasks = content.match(/##\s*Task\s*\d+/gi) || [];
    const taskCount = xmlTasks.length || mdTasks.length;

    const etapa = parseInt(String(fm['etapa'] ?? 1), 10) || 1;

    let autonomous = true;
    if (fm['autonomous'] !== undefined) {
      autonomous = fm['autonomous'] === 'true' || fm['autonomous'] === true;
    }

    if (!autonomous) {
      hasCheckpoints = true;
    }

    let filesModified: string[] = [];
    const fmFiles = fm['files_modified'] || fm['files-modified'];
    if (fmFiles) {
      filesModified = Array.isArray(fmFiles) ? (fmFiles as string[]) : [String(fmFiles)];
    }

    const hasSummary = completedPlanIds.has(planId);
    if (!hasSummary) {
      incomplete.push(planId);
    }

    const plan = {
      id: planId,
      etapa,
      autonomous,
      objective: extractObjective(content) || (fm['objective'] as string | undefined) || null,
      files_modified: filesModified,
      task_count: taskCount,
      has_summary: hasSummary,
    };

    plans.push(plan);

    const etapaKey = String(etapa);
    if (!etapas[etapaKey]) {
      etapas[etapaKey] = [];
    }
    etapas[etapaKey].push(planId);
  }

  output({ phase: normalized, plans, etapas, incomplete, has_checkpoints: hasCheckpoints }, raw);
}

export function cmdEtapaAdd(cwd: string, description: string, raw: boolean): void {
  if (!description) {
    error('descrição obrigatória para adicionar fase');
  }

  const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) {
    error('ROADMAP.md não encontrado');
  }

  const content = fs.readFileSync(roadmapPath, 'utf-8');
  const slug = generateSlugInternal(description);

  // Find highest integer phase number
  const phasePattern = /#{2,4}\s*Phase\s+(\d+)[A-Z]?(?:\.\d+)*:/gi;
  let maxEtapa = 0;
  let m: RegExpExecArray | null;
  while ((m = phasePattern.exec(content)) !== null) {
    const num = parseInt(m[1], 10);
    if (num > maxEtapa) maxEtapa = num;
  }

  const newPhaseNum = maxEtapa + 1;
  const paddedNum = String(newPhaseNum).padStart(2, '0');
  const dirName = `${paddedNum}-${slug}`;
  const dirPath = path.join(cwd, '.fase-ai', 'etapas', dirName);

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');

  const phaseEntry = `\n### Fase ${newPhaseNum}: ${description}\n\n**Objetivo:** [A ser planejado]\n**Requisitos**: TBD\n**Depende de:** Fase ${maxEtapa}\n**Planos:** 0 planos\n\nPlanos:\n- [ ] TBD (execute /gsd:plan-phase ${newPhaseNum} para quebrar)\n`;

  let updatedContent: string;
  const lastSeparator = content.lastIndexOf('\n---');
  if (lastSeparator > 0) {
    updatedContent = content.slice(0, lastSeparator) + phaseEntry + content.slice(lastSeparator);
  } else {
    updatedContent = content + phaseEntry;
  }

  fs.writeFileSync(roadmapPath, updatedContent, 'utf-8');

  output(
    {
      phase_number: newPhaseNum,
      padded: paddedNum,
      name: description,
      slug,
      directory: `.fase-ai/phases/${dirName}`,
    },
    raw,
    paddedNum
  );
}

export function cmdEtapaInsert(
  cwd: string,
  afterPhase: string,
  description: string,
  raw: boolean
): void {
  if (!afterPhase || !description) {
    error('fase-anterior e descrição obrigatórias para inserir fase');
  }

  const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) {
    error('ROADMAP.md não encontrado');
  }

  const content = fs.readFileSync(roadmapPath, 'utf-8');
  const slug = generateSlugInternal(description);

  const normalizedAfter = normalizeEtapaNome(afterPhase);
  const unpadded = normalizedAfter.replace(/^0+/, '');
  const afterPhaseEscaped = unpadded.replace(/\./g, '\\.');
  const targetPattern = new RegExp(`#{2,4}\\s*Phase\\s+0*${afterPhaseEscaped}:`, 'i');
  if (!targetPattern.test(content)) {
    error(`Fase ${afterPhase} não encontrada em ROADMAP.md`);
  }

  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const normalizedBase = normalizeEtapaNome(afterPhase);
  const existingDecimalNums: number[] = [];

  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    const dirs = entries.filter((e: fs.Dirent) => e.isDirectory()).map((e: fs.Dirent) => e.name);
    const decimalPattern = new RegExp(`^${normalizedBase}\\.(\\d+)`);
    for (const dir of dirs) {
      const dm = dir.match(decimalPattern);
      if (dm) existingDecimalNums.push(parseInt(dm[1], 10));
    }
  } catch {}

  const nextDecimal = existingDecimalNums.length === 0 ? 1 : Math.max(...existingDecimalNums) + 1;
  const decimalEtapa = `${normalizedBase}.${nextDecimal}`;
  const dirName = `${decimalEtapa}-${slug}`;
  const dirPath = path.join(cwd, '.fase-ai', 'etapas', dirName);

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');

  const phaseEntry = `\n### Fase ${decimalEtapa}: ${description} (INSERIDA)\n\n**Objetivo:** [Trabalho urgente - a ser planejado]\n**Requisitos**: TBD\n**Depende de:** Fase ${afterPhase}\n**Planos:** 0 planos\n\nPlanos:\n- [ ] TBD (execute /gsd:plan-phase ${decimalEtapa} para quebrar)\n`;

  const headerPattern = new RegExp(`(#{2,4}\\s*Phase\\s+0*${afterPhaseEscaped}:[^\\n]*\\n)`, 'i');
  const headerMatch = content.match(headerPattern);
  if (!headerMatch) {
    error(`Não foi possível encontrar cabeçalho da Fase ${afterPhase}`);
  }

  const headerIdx = content.indexOf(headerMatch![0]);
  const afterHeader = content.slice(headerIdx + headerMatch![0].length);
  const nextPhaseMatch = afterHeader.match(/\n#{2,4}\s+Phase\s+\d/i);

  let insertIdx: number;
  if (nextPhaseMatch) {
    insertIdx = headerIdx + headerMatch![0].length + (nextPhaseMatch.index ?? 0);
  } else {
    insertIdx = content.length;
  }

  const updatedContent = content.slice(0, insertIdx) + phaseEntry + content.slice(insertIdx);
  fs.writeFileSync(roadmapPath, updatedContent, 'utf-8');

  output(
    {
      phase_number: decimalEtapa,
      after_phase: afterPhase,
      name: description,
      slug,
      directory: `.fase-ai/phases/${dirName}`,
    },
    raw,
    decimalEtapa
  );
}

interface EtapaRemoveOptions {
  force?: boolean;
}

export function cmdEtapaRemove(
  cwd: string,
  targetPhase: string,
  options: EtapaRemoveOptions,
  raw: boolean
): void {
  if (!targetPhase) {
    error('número da fase obrigatório para remover fase');
  }

  const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const force = options.force || false;

  if (!fs.existsSync(roadmapPath)) {
    error('ROADMAP.md not found');
  }

  const normalized = normalizeEtapaNome(targetPhase);
  const isDecimal = targetPhase.includes('.');

  let targetDir: string | null = null;
  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    const dirs = entries
      .filter((e: fs.Dirent) => e.isDirectory())
      .map((e: fs.Dirent) => e.name)
      .sort((a: string, b: string) => compareEtapaNum(a, b));
    targetDir =
      dirs.find((d: string) => d.startsWith(normalized + '-') || d === normalized) ?? null;
  } catch {}

  if (targetDir && !force) {
    const targetPath = path.join(etapasDir, targetDir);
    const files = fs.readdirSync(targetPath);
    const summaries = files.filter((f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md');
    if (summaries.length > 0) {
      error(
        `Etapa ${targetPhase} has ${summaries.length} executed plan(s). Use --force to remove anyway.`
      );
    }
  }

  if (targetDir) {
    fs.rmSync(path.join(etapasDir, targetDir), { recursive: true, force: true });
  }

  const renamedDirs: { from: string; to: string }[] = [];
  const renamedFiles: { from: string; to: string }[] = [];

  if (isDecimal) {
    const baseParts = normalized.split('.');
    const baseInt = baseParts[0];
    const removedDecimal = parseInt(baseParts[1], 10);

    try {
      const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
      const dirs = entries
        .filter((e: fs.Dirent) => e.isDirectory())
        .map((e: fs.Dirent) => e.name)
        .sort((a: string, b: string) => compareEtapaNum(a, b));

      const decPattern = new RegExp(`^${baseInt}\\.(\\d+)-(.+)$`);
      const toRename: { dir: string; oldDecimal: number; slug: string }[] = [];
      for (const dir of dirs) {
        const dm = dir.match(decPattern);
        if (dm && parseInt(dm[1], 10) > removedDecimal) {
          toRename.push({ dir, oldDecimal: parseInt(dm[1], 10), slug: dm[2] });
        }
      }

      toRename.sort((a, b) => b.oldDecimal - a.oldDecimal);

      for (const item of toRename) {
        const newDecimal = item.oldDecimal - 1;
        const oldPhaseId = `${baseInt}.${item.oldDecimal}`;
        const newPhaseId = `${baseInt}.${newDecimal}`;
        const newDirName = `${baseInt}.${newDecimal}-${item.slug}`;

        fs.renameSync(path.join(etapasDir, item.dir), path.join(etapasDir, newDirName));
        renamedDirs.push({ from: item.dir, to: newDirName });

        const dirFiles = fs.readdirSync(path.join(etapasDir, newDirName));
        for (const f of dirFiles) {
          if (f.includes(oldPhaseId)) {
            const newFileName = f.replace(oldPhaseId, newPhaseId);
            fs.renameSync(
              path.join(etapasDir, newDirName, f),
              path.join(etapasDir, newDirName, newFileName)
            );
            renamedFiles.push({ from: f, to: newFileName });
          }
        }
      }
    } catch {}
  } else {
    const removedInt = parseInt(normalized, 10);

    try {
      const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
      const dirs = entries
        .filter((e: fs.Dirent) => e.isDirectory())
        .map((e: fs.Dirent) => e.name)
        .sort((a: string, b: string) => compareEtapaNum(a, b));

      const toRename: {
        dir: string;
        oldInt: number;
        letter: string;
        decimal: number | null;
        slug: string;
      }[] = [];
      for (const dir of dirs) {
        const dm = dir.match(/^(\d+)([A-Z])?(?:\.(\d+))?-(.+)$/i);
        if (!dm) continue;
        const dirInt = parseInt(dm[1], 10);
        if (dirInt > removedInt) {
          toRename.push({
            dir,
            oldInt: dirInt,
            letter: dm[2] ? dm[2].toUpperCase() : '',
            decimal: dm[3] ? parseInt(dm[3], 10) : null,
            slug: dm[4],
          });
        }
      }

      toRename.sort((a, b) => {
        if (a.oldInt !== b.oldInt) return b.oldInt - a.oldInt;
        return (b.decimal || 0) - (a.decimal || 0);
      });

      for (const item of toRename) {
        const newInt = item.oldInt - 1;
        const newPadded = String(newInt).padStart(2, '0');
        const oldPadded = String(item.oldInt).padStart(2, '0');
        const letterSuffix = item.letter || '';
        const decimalSuffix = item.decimal !== null ? `.${item.decimal}` : '';
        const oldPrefix = `${oldPadded}${letterSuffix}${decimalSuffix}`;
        const newPrefix = `${newPadded}${letterSuffix}${decimalSuffix}`;
        const newDirName = `${newPrefix}-${item.slug}`;

        fs.renameSync(path.join(etapasDir, item.dir), path.join(etapasDir, newDirName));
        renamedDirs.push({ from: item.dir, to: newDirName });

        const dirFiles = fs.readdirSync(path.join(etapasDir, newDirName));
        for (const f of dirFiles) {
          if (f.startsWith(oldPrefix)) {
            const newFileName = newPrefix + f.slice(oldPrefix.length);
            fs.renameSync(
              path.join(etapasDir, newDirName, f),
              path.join(etapasDir, newDirName, newFileName)
            );
            renamedFiles.push({ from: f, to: newFileName });
          }
        }
      }
    } catch {}
  }

  // Update ROADMAP.md
  let roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');

  const targetEscaped = escapeRegex(targetPhase);
  const sectionPattern = new RegExp(
    `\\n?#{2,4}\\s*Phase\\s+${targetEscaped}\\s*:[\\s\\S]*?(?=\\n#{2,4}\\s+Phase\\s+\\d|$)`,
    'i'
  );
  roadmapContent = roadmapContent.replace(sectionPattern, '');

  const checkboxPattern = new RegExp(
    `\\n?-\\s*\\[[ x]\\]\\s*.*Phase\\s+${targetEscaped}[:\\s][^\\n]*`,
    'gi'
  );
  roadmapContent = roadmapContent.replace(checkboxPattern, '');

  const tableRowPattern = new RegExp(`\\n?\\|\\s*${targetEscaped}\\.?\\s[^|]*\\|[^\\n]*`, 'gi');
  roadmapContent = roadmapContent.replace(tableRowPattern, '');

  if (!isDecimal) {
    const removedInt = parseInt(normalized, 10);
    const maxEtapa = 99;

    for (let oldNum = maxEtapa; oldNum > removedInt; oldNum--) {
      const newNum = oldNum - 1;
      const oldStr = String(oldNum);
      const newStr = String(newNum);
      const oldPad = oldStr.padStart(2, '0');
      const newPad = newStr.padStart(2, '0');

      roadmapContent = roadmapContent.replace(
        new RegExp(`(#{2,4}\\s*Phase\\s+)${oldStr}(\\s*:)`, 'gi'),
        `$1${newStr}$2`
      );

      roadmapContent = roadmapContent.replace(
        new RegExp(`(Phase\\s+)${oldStr}([:\\s])`, 'g'),
        `$1${newStr}$2`
      );

      roadmapContent = roadmapContent.replace(
        new RegExp(`${oldPad}-(\\d{2})`, 'g'),
        `${newPad}-$1`
      );

      roadmapContent = roadmapContent.replace(
        new RegExp(`(\\|\\s*)${oldStr}\\.\\s`, 'g'),
        `$1${newStr}. `
      );

      roadmapContent = roadmapContent.replace(
        new RegExp(`(Depends on:\\*\\*\\s*Phase\\s+)${oldStr}\\b`, 'gi'),
        `$1${newStr}`
      );
    }
  }

  fs.writeFileSync(roadmapPath, roadmapContent, 'utf-8');

  const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
  if (fs.existsSync(statePath)) {
    let stateContent = fs.readFileSync(statePath, 'utf-8');
    const totalPattern = /(\*\*Total Phases:\*\*\s*)(\d+)/;
    const totalMatch = stateContent.match(totalPattern);
    if (totalMatch) {
      const oldTotal = parseInt(totalMatch[2], 10);
      stateContent = stateContent.replace(totalPattern, `$1${oldTotal - 1}`);
    }
    const ofPattern = /(\bof\s+)(\d+)(\s*(?:\(|phases?))/i;
    const ofMatch = stateContent.match(ofPattern);
    if (ofMatch) {
      const oldTotal = parseInt(ofMatch[2], 10);
      stateContent = stateContent.replace(ofPattern, `$1${oldTotal - 1}$3`);
    }
    writeStateMd(statePath, stateContent, cwd);
  }

  output(
    {
      removed: targetPhase,
      directory_deleted: targetDir || null,
      renamed_directories: renamedDirs,
      renamed_files: renamedFiles,
      roadmap_updated: true,
      state_updated: fs.existsSync(statePath),
    },
    raw
  );
}

export function cmdEtapaComplete(cwd: string, etapaNum: string, raw: boolean): void {
  if (!etapaNum) {
    error('número da fase obrigatório para completar fase');
  }

  const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
  const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const today = new Date().toISOString().split('T')[0];

  const phaseInfo = findEtapaInternal(cwd, etapaNum);
  if (!phaseInfo) {
    error(`Etapa ${etapaNum} not found`);
  }

  const planCount = phaseInfo!.plans.length;
  const summaryCount = phaseInfo!.summaries.length;

  if (fs.existsSync(roadmapPath)) {
    let roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');

    const checkboxPattern = new RegExp(
      `(-\\s*\\[)[ ](\\]\\s*.*Phase\\s+${escapeRegex(etapaNum)}[:\\s][^\\n]*)`,
      'i'
    );
    roadmapContent = roadmapContent.replace(checkboxPattern, `$1x$2 (completed ${today})`);

    const phaseEscaped = escapeRegex(etapaNum);
    const tablePattern = new RegExp(
      `(\\|\\s*${phaseEscaped}\\.?\\s[^|]*\\|[^|]*\\|)\\s*[^|]*(\\|)\\s*[^|]*(\\|)`,
      'i'
    );
    roadmapContent = roadmapContent.replace(tablePattern, `$1 Complete    $2 ${today} $3`);

    const planCountPattern = new RegExp(
      `(#{2,4}\\s*Phase\\s+${phaseEscaped}[\\s\\S]*?\\*\\*Plans:\\*\\*\\s*)[^\\n]+`,
      'i'
    );
    roadmapContent = roadmapContent.replace(
      planCountPattern,
      `$1${summaryCount}/${planCount} plans complete`
    );

    fs.writeFileSync(roadmapPath, roadmapContent, 'utf-8');

    const reqPath = path.join(cwd, '.fase-ai', 'REQUIREMENTS.md');
    if (fs.existsSync(reqPath)) {
      const reqMatch = roadmapContent.match(
        new RegExp(
          `Phase\\s+${escapeRegex(etapaNum)}[\\s\\S]*?\\*\\*Requirements:\\*\\*\\s*([^\\n]+)`,
          'i'
        )
      );

      if (reqMatch) {
        const reqIds = reqMatch[1]
          .replace(/[\[\]]/g, '')
          .split(/[,\s]+/)
          .map((r: string) => r.trim())
          .filter(Boolean);
        let reqContent = fs.readFileSync(reqPath, 'utf-8');

        for (const reqId of reqIds) {
          const reqEscaped = escapeRegex(reqId);
          reqContent = reqContent.replace(
            new RegExp(`(-\\s*\\[)[ ](\\]\\s*\\*\\*${reqEscaped}\\*\\*)`, 'gi'),
            '$1x$2'
          );
          reqContent = reqContent.replace(
            new RegExp(`(\\|\\s*${reqEscaped}\\s*\\|[^|]+\\|)\\s*Pending\\s*(\\|)`, 'gi'),
            '$1 Complete $2'
          );
        }

        fs.writeFileSync(reqPath, reqContent, 'utf-8');
      }
    }
  }

  let nextPhaseNum: string | null = null;
  let nextPhaseName: string | null = null;
  let isLastEtapa = true;

  try {
    const isDirInMilestone = getMilestoneEtapaFilter(cwd);
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    const dirs = entries
      .filter((e: fs.Dirent) => e.isDirectory())
      .map((e: fs.Dirent) => e.name)
      .filter(isDirInMilestone)
      .sort((a: string, b: string) => compareEtapaNum(a, b));

    for (const dir of dirs) {
      const dm = dir.match(/^(\d+[A-Z]?(?:\.\d+)*)-?(.*)/i);
      if (dm) {
        if (compareEtapaNum(dm[1], etapaNum) > 0) {
          nextPhaseNum = dm[1];
          nextPhaseName = dm[2] || null;
          isLastEtapa = false;
          break;
        }
      }
    }
  } catch {}

  if (isLastEtapa && fs.existsSync(roadmapPath)) {
    try {
      const roadmapForPhases = fs.readFileSync(roadmapPath, 'utf-8');
      const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:\s*([^\n]+)/gi;
      let pm: RegExpExecArray | null;
      while ((pm = phasePattern.exec(roadmapForPhases)) !== null) {
        if (compareEtapaNum(pm[1], etapaNum) > 0) {
          nextPhaseNum = pm[1];
          nextPhaseName = pm[2]
            .replace(/\(INSERTED\)/i, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');
          isLastEtapa = false;
          break;
        }
      }
    } catch {}
  }

  if (fs.existsSync(statePath)) {
    let stateContent = fs.readFileSync(statePath, 'utf-8');

    stateContent = stateContent.replace(
      /(\*\*Current Phase:\*\*\s*).*/,
      `$1${nextPhaseNum || etapaNum}`
    );

    if (nextPhaseName) {
      stateContent = stateContent.replace(
        /(\*\*Current Etapa Name:\*\*\s*).*/,
        `$1${nextPhaseName.replace(/-/g, ' ')}`
      );
    }

    stateContent = stateContent.replace(
      /(\*\*Status:\*\*\s*).*/,
      `$1${isLastEtapa ? 'Marco completo' : 'Pronto para planejar'}`
    );

    stateContent = stateContent.replace(/(\*\*Current Plan:\*\*\s*).*/, `$1Não iniciado`);

    stateContent = stateContent.replace(/(\*\*Last Activity:\*\*\s*).*/, `$1${today}`);

    stateContent = stateContent.replace(
      /(\*\*Last Activity Description:\*\*\s*).*/,
      `$1Etapa ${etapaNum} complete${nextPhaseNum ? `, transitioned to Etapa ${nextPhaseNum}` : ''}`
    );

    writeStateMd(statePath, stateContent, cwd);
  }

  output(
    {
      completed_phase: etapaNum,
      phase_name: phaseInfo!.phase_name,
      plans_executed: `${summaryCount}/${planCount}`,
      next_phase: nextPhaseNum,
      next_phase_name: nextPhaseName,
      is_last_phase: isLastEtapa,
      date: today,
      roadmap_updated: fs.existsSync(roadmapPath),
      state_updated: fs.existsSync(statePath),
    },
    raw
  );
}
