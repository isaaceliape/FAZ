/**
 * Milestone — Milestone and requirements lifecycle operations
 */

import fs from 'fs';
import path from 'path';
import { escapeRegex, getMilestoneEtapaFilter, output, error } from './core.js';
import { extractFrontmatter } from './frontmatter.js';
import { writeStateMd } from './state.js';

export function cmdRequirementsMarkComplete(cwd: string, reqIdsRaw: string[], raw: boolean): void {
  if (!reqIdsRaw || reqIdsRaw.length === 0) {
    error(
      'IDs de requisitos obrigatórios. Uso: requirements mark-complete REQ-01,REQ-02 ou REQ-01 REQ-02'
    );
  }

  // Accept comma-separated, space-separated, or bracket-wrapped: [REQ-01, REQ-02]
  const reqIds = reqIdsRaw
    .join(' ')
    .replace(/[\[\]]/g, '')
    .split(/[,\s]+/)
    .map((r: string) => r.trim())
    .filter(Boolean);

  if (reqIds.length === 0) {
    error('nenhum ID de requisito válido encontrado');
  }

  const reqPath = path.join(cwd, '.fase-ai', 'REQUIREMENTS.md');
  if (!fs.existsSync(reqPath)) {
    output(
      { updated: false, reason: 'REQUIREMENTS.md não encontrado', ids: reqIds },
      raw,
      'no requirements file'
    );
    return;
  }

  let reqContent = fs.readFileSync(reqPath, 'utf-8');
  const updated: string[] = [];
  const notFound: string[] = [];

  for (const reqId of reqIds) {
    let found = false;
    const reqEscaped = escapeRegex(reqId);

    // Update checkbox: - [ ] **REQ-ID** → - [x] **REQ-ID**
    const checkboxPattern = new RegExp(`(-\\s*\\[)[ ](\\]\\s*\\*\\*${reqEscaped}\\*\\*)`, 'gi');
    if (checkboxPattern.test(reqContent)) {
      reqContent = reqContent.replace(checkboxPattern, '$1x$2');
      found = true;
    }

    // Update traceability table: | REQ-ID | Etapa N | Pending | → | REQ-ID | Etapa N | Complete |
    const tablePattern = new RegExp(
      `(\\|\\s*${reqEscaped}\\s*\\|[^|]+\\|)\\s*Pending\\s*(\\|)`,
      'gi'
    );
    if (tablePattern.test(reqContent)) {
      // Re-read since test() advances lastIndex for global regex
      reqContent = reqContent.replace(
        new RegExp(`(\\|\\s*${reqEscaped}\\s*\\|[^|]+\\|)\\s*Pending\\s*(\\|)`, 'gi'),
        '$1 Complete $2'
      );
      found = true;
    }

    if (found) {
      updated.push(reqId);
    } else {
      notFound.push(reqId);
    }
  }

  if (updated.length > 0) {
    fs.writeFileSync(reqPath, reqContent, 'utf-8');
  }

  output(
    {
      updated: updated.length > 0,
      marked_complete: updated,
      not_found: notFound,
      total: reqIds.length,
    },
    raw,
    `${updated.length}/${reqIds.length} requirements marked complete`
  );
}

interface MilestoneCompleteOptions {
  name?: string;
  archivePhases?: boolean;
}

export function cmdMilestoneComplete(
  cwd: string,
  version: string,
  options: MilestoneCompleteOptions,
  raw: boolean
): void {
  if (!version) {
    error('versão obrigatória para completar marco (ex: v1.0)');
  }

  const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
  const reqPath = path.join(cwd, '.fase-ai', 'REQUIREMENTS.md');
  const statePath = path.join(cwd, '.fase-ai', 'STATE.md');
  const milestonesPath = path.join(cwd, '.fase-ai', 'MILESTONES.md');
  const archiveDir = path.join(cwd, '.fase-ai', 'milestones');
  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const today = new Date().toISOString().split('T')[0];
  const milestoneName = options.name || version;

  // Ensure archive directory exists
  fs.mkdirSync(archiveDir, { recursive: true });

  // Scope stats and accomplishments to only the phases belonging to the
  // current milestone's ROADMAP.  Uses the shared filter from core.ts
  // (same logic used by cmdEtapasList and other callers).
  const isDirInMilestone = getMilestoneEtapaFilter(cwd);

  // Gather stats from phases (scoped to current milestone only)
  let phaseCount = 0;
  let totalPlans = 0;
  let totalTasks = 0;
  const accomplishments: string[] = [];

  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    const dirs = entries
      .filter((e: fs.Dirent) => e.isDirectory())
      .map((e: fs.Dirent) => e.name)
      .sort();

    for (const dir of dirs) {
      if (!isDirInMilestone(dir)) continue;

      phaseCount++;
      const phaseFiles = fs.readdirSync(path.join(etapasDir, dir));
      const plans = phaseFiles.filter((f: string) => f.endsWith('-PLAN.md') || f === 'PLAN.md');
      const summaries = phaseFiles.filter(
        (f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md'
      );
      totalPlans += plans.length;

      // Extract one-liners from summaries
      for (const s of summaries) {
        try {
          const content = fs.readFileSync(path.join(etapasDir, dir, s), 'utf-8');
          const fm = extractFrontmatter(content);
          if (fm['one-liner']) {
            accomplishments.push(String(fm['one-liner']));
          }
          // Count tasks
          const taskMatches = content.match(/##\s*Task\s*\d+/gi) || [];
          totalTasks += taskMatches.length;
        } catch {}
      }
    }
  } catch {}

  // Archive ROADMAP.md
  if (fs.existsSync(roadmapPath)) {
    const roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');
    fs.writeFileSync(path.join(archiveDir, `${version}-ROADMAP.md`), roadmapContent, 'utf-8');
  }

  // Archive REQUIREMENTS.md
  if (fs.existsSync(reqPath)) {
    const reqContent = fs.readFileSync(reqPath, 'utf-8');
    const archiveHeader = `# Arquivo de Requisitos: ${version} ${milestoneName}\n\n**Arquivado:** ${today}\n**Status:** ENTREGUE\n\nPara requisitos atuais, veja \`.fase-ai/REQUIREMENTS.md\`.\n\n---\n\n`;
    fs.writeFileSync(
      path.join(archiveDir, `${version}-REQUIREMENTS.md`),
      archiveHeader + reqContent,
      'utf-8'
    );
  }

  // Archive audit file if exists
  const auditFile = path.join(cwd, '.fase-ai', `${version}-MILESTONE-AUDIT.md`);
  if (fs.existsSync(auditFile)) {
    fs.renameSync(auditFile, path.join(archiveDir, `${version}-MILESTONE-AUDIT.md`));
  }

  // Create/append MILESTONES.md entry
  const accomplishmentsList = accomplishments.map((a: string) => `- ${a}`).join('\n');
  const milestoneEntry = `## ${version} ${milestoneName} (Shipped: ${today})\n\n**Phases completed:** ${phaseCount} phases, ${totalPlans} plans, ${totalTasks} tasks\n\n**Key accomplishments:**\n${accomplishmentsList || '- (none recorded)'}\n\n---\n\n`;

  if (fs.existsSync(milestonesPath)) {
    const existing = fs.readFileSync(milestonesPath, 'utf-8');
    if (!existing.trim()) {
      // Empty file — treat like new
      fs.writeFileSync(milestonesPath, `# Milestones\n\n${milestoneEntry}`, 'utf-8');
    } else {
      // Insert after the header line(s) for reverse chronological order (newest first)
      const headerMatch = existing.match(/^(#{1,3}\s+[^\n]*\n\n?)/);
      if (headerMatch) {
        const header = headerMatch[1];
        const rest = existing.slice(header.length);
        fs.writeFileSync(milestonesPath, header + milestoneEntry + rest, 'utf-8');
      } else {
        // No recognizable header — prepend the entry
        fs.writeFileSync(milestonesPath, milestoneEntry + existing, 'utf-8');
      }
    }
  } else {
    fs.writeFileSync(milestonesPath, `# Milestones\n\n${milestoneEntry}`, 'utf-8');
  }

  // Update STATE.md
  if (fs.existsSync(statePath)) {
    let stateContent = fs.readFileSync(statePath, 'utf-8');
    stateContent = stateContent.replace(
      /(\*\*Status:\*\*\s*).*/,
      `$1${version} milestone complete`
    );
    stateContent = stateContent.replace(/(\*\*Last Activity:\*\*\s*).*/, `$1${today}`);
    stateContent = stateContent.replace(
      /(\*\*Last Activity Description:\*\*\s*).*/,
      `$1${version} milestone completed and archived`
    );
    writeStateMd(statePath, stateContent, cwd);
  }

  // Archive phase directories if requested
  let phasesArchived = false;
  if (options.archivePhases) {
    try {
      const phaseArchiveDir = path.join(archiveDir, `${version}-phases`);
      fs.mkdirSync(phaseArchiveDir, { recursive: true });

      const phaseEntries = fs.readdirSync(etapasDir, { withFileTypes: true });
      const phaseDirNames = phaseEntries
        .filter((e: fs.Dirent) => e.isDirectory())
        .map((e: fs.Dirent) => e.name);
      let archivedCount = 0;
      for (const dir of phaseDirNames) {
        if (!isDirInMilestone(dir)) continue;
        fs.renameSync(path.join(etapasDir, dir), path.join(phaseArchiveDir, dir));
        archivedCount++;
      }
      phasesArchived = archivedCount > 0;
    } catch {}
  }

  const result = {
    version,
    name: milestoneName,
    date: today,
    phases: phaseCount,
    plans: totalPlans,
    tasks: totalTasks,
    accomplishments,
    archived: {
      roadmap: fs.existsSync(path.join(archiveDir, `${version}-ROADMAP.md`)),
      requirements: fs.existsSync(path.join(archiveDir, `${version}-REQUIREMENTS.md`)),
      audit: fs.existsSync(path.join(archiveDir, `${version}-MILESTONE-AUDIT.md`)),
      phases: phasesArchived,
    },
    milestones_updated: true,
    state_updated: fs.existsSync(statePath),
  };

  output(result, raw);
}
