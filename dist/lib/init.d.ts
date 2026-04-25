/**
 * Init — Compound init commands for workflow bootstrapping
 *
 * Each cmdInit* function composes InitContext (common config, milestone, paths)
 * with specific fields for its use case. See init-context.ts for the seam.
 */
export declare function cmdInitExecutePhase(cwd: string, phase: string, raw: boolean): void;
export declare function cmdInitPlanPhase(cwd: string, phase: string, raw: boolean): void;
export declare function cmdInitNewProject(cwd: string, raw: boolean): void;
export declare function cmdInitNewMilestone(cwd: string, raw: boolean): void;
export declare function cmdInitQuick(cwd: string, description: string, raw: boolean): void;
export declare function cmdInitResume(cwd: string, raw: boolean): void;
export declare function cmdInitVerifyWork(cwd: string, phase: string, raw: boolean): void;
export declare function cmdInitPhaseOp(cwd: string, phase: string, raw: boolean): void;
export declare function cmdInitTodos(cwd: string, area: string, raw: boolean): void;
export declare function cmdInitMilestoneOp(cwd: string, raw: boolean): void;
export declare function cmdInitMapCodebase(cwd: string, raw: boolean): void;
export declare function cmdInitProgress(cwd: string, raw: boolean): void;
