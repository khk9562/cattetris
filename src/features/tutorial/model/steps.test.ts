import { describe, expect, it } from 'vitest';
import { INITIAL_TUTORIAL, TUTORIAL_STEPS, segmentStart, tutorialReducer } from './steps';

describe('tutorialReducer', () => {
  it('advances only on the matching event and finishes at the last step', () => {
    let s = tutorialReducer(INITIAL_TUTORIAL, { type: 'begin' });
    expect(s.active).toBe(true);
    s = tutorialReducer(s, { type: 'event', kind: 'rotate' });
    expect(s.stepIndex).toBe(0);
    s = tutorialReducer(s, { type: 'event', kind: 'move' });
    expect(s.stepIndex).toBe(1);
    for (const kind of ['rotate', 'hardDrop', 'hold', 'line', 'explode'] as const) s = tutorialReducer(s, { type: 'event', kind });
    expect(s.stepIndex).toBe(TUTORIAL_STEPS.length - 1);
    expect(TUTORIAL_STEPS[s.stepIndex].done).toBe('button');
    s = tutorialReducer(s, { type: 'event', kind: 'move' });
    expect(s.completed).toBe(false);
    s = tutorialReducer(s, { type: 'next' });
    expect(s.completed).toBe(true);
    expect(s.active).toBe(false);
  });

  it('skip ends and marks completed, exit only deactivates', () => {
    const begun = tutorialReducer(INITIAL_TUTORIAL, { type: 'begin' });
    expect(tutorialReducer(begun, { type: 'skip' })).toMatchObject({ active: false, completed: true });
    expect(tutorialReducer(begun, { type: 'exit' })).toMatchObject({ active: false, completed: false });
  });

  it('finds the segment start with a setup', () => {
    expect(segmentStart(3).id).toBe('move');
    expect(segmentStart(4).id).toBe('line');
    expect(segmentStart(5).id).toBe('explode');
  });

  it('keeps the explode setup board solvable: 7 siamese + O piece reaches the threshold', () => {
    const step = TUTORIAL_STEPS.find(s => s.id === 'explode')!;
    const siamese = step.setup!.board!.flat().filter(c => c === 'siamese').length;
    expect(siamese + 4).toBeGreaterThanOrEqual(step.presetOverride!.clusterThreshold!);
  });
});
