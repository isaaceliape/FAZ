/**
 * State — STATE.md operations and progression engine
 *
 * This module provides command functions for STATE.md manipulation.
 * Core utilities are in submodules:
 *   - state/types.ts: Options interfaces
 *   - state/field-utils.ts: Field extraction/replacement
 *   - state/frontmatter-sync.ts: Frontmatter synchronization
 *   - state/lock.ts: PID-based file locking and writeStateMd
 */
import { StateMetricOptions, StateDecisionOptions, StateBlockerOptions, StateSessionOptions } from './state/types.js';
export { StateMetricOptions, StateDecisionOptions, StateBlockerOptions, StateSessionOptions, } from './state/types.js';
export { stateExtractField, stateReplaceField } from './state/field-utils.js';
export { writeStateMd } from './state/lock.js';
export declare function cmdStateLoad(cwd: string, raw: boolean): void;
export declare function cmdStateGet(cwd: string, section: string | undefined, raw: boolean): void;
export declare function cmdStatePatch(cwd: string, patches: Record<string, string>, raw: boolean): void;
export declare function cmdStateUpdate(cwd: string, field: string, value: string): void;
export declare function cmdStateAdvancePlan(cwd: string, raw: boolean): void;
export declare function cmdStateRecordMetric(cwd: string, options: StateMetricOptions, raw: boolean): void;
export declare function cmdStateUpdateProgress(cwd: string, raw: boolean): void;
export declare function cmdStateAddDecision(cwd: string, options: StateDecisionOptions, raw: boolean): void;
export declare function cmdStateAddBlocker(cwd: string, text: string | StateBlockerOptions, raw: boolean): void;
export declare function cmdStateResolveBlocker(cwd: string, text: string | undefined, raw: boolean): void;
export declare function cmdStateRecordSession(cwd: string, options: StateSessionOptions, raw: boolean): void;
export declare function cmdStateSnapshot(cwd: string, raw: boolean): void;
export declare function cmdStateJson(cwd: string, raw: boolean): void;
