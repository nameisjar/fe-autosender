import { describe, expect, it } from 'vitest';
import {
  createOutgoingMessageId,
  mergeOutgoingResponseStatus,
  mergeOutgoingSnapshotStatuses,
  mergeOutgoingStatus,
  normalizeOutgoingUiStatus,
  OUTGOING_STATUS_HIERARCHY,
} from '../../utils/outgoingStatus.js';

describe('outgoing message status helpers', () => {
  it('treats pending and sending as the same optimistic UI state', () => {
    expect(normalizeOutgoingUiStatus('pending')).toBe('sending');
    expect(normalizeOutgoingUiStatus('sending')).toBe('sending');
    expect(OUTGOING_STATUS_HIERARCHY.pending).toBe(
      OUTGOING_STATUS_HIERARCHY.sending,
    );
  });

  it('does not promote an HTTP response without an explicit WhatsApp ACK', () => {
    expect(mergeOutgoingResponseStatus('sending', undefined)).toBe('sending');
    expect(mergeOutgoingResponseStatus('pending', null)).toBe('sending');
    expect(mergeOutgoingResponseStatus('sending', 'pending')).toBe('sending');
  });

  it.each(['error', 'delivery_ack', 'read'])(
    'does not overwrite an early %s socket status with an HTTP response',
    earlyStatus => {
      expect(mergeOutgoingResponseStatus(earlyStatus, 'pending')).toBe(earlyStatus);
      expect(mergeOutgoingResponseStatus(earlyStatus, 'server_ack')).toBe(earlyStatus);
    },
  );

  it('uses an explicit ACK or NACK when no final socket status arrived first', () => {
    expect(mergeOutgoingResponseStatus('sending', 'server_ack')).toBe('server_ack');
    expect(mergeOutgoingResponseStatus('sending', 'delivery_ack')).toBe('delivery_ack');
    expect(mergeOutgoingResponseStatus('sending', 'error')).toBe('error');
  });

  it('keeps an error terminal against every later status event', () => {
    for (const laterStatus of [
      'pending',
      'sending',
      'server_ack',
      'delivery_ack',
      'read',
      'played',
    ]) {
      expect(mergeOutgoingStatus('error', laterStatus)).toBe('error');
      expect(mergeOutgoingStatus('failed', laterStatus)).toBe('error');
    }
  });

  it('merges stale database snapshots by all supported message IDs', () => {
    const current = [
      { tempId: 'message-a', status: 'error', text: 'local a' },
      { waMessageId: 'message-b', status: 'delivery_ack', text: 'local b' },
      { id: 'message-c', status: 'read', text: 'local c' },
    ];
    const snapshot = [
      { id: 'message-a', status: 'pending', text: 'database a' },
      { id: 'database-b', waMessageId: 'message-b', status: 'server_ack', text: 'database b' },
      { tempId: 'message-c', status: 'pending', text: 'database c' },
      { id: 'message-d', status: 'server_ack', text: 'database d' },
    ];

    const merged = mergeOutgoingSnapshotStatuses(current, snapshot);

    expect(merged.map(message => message.status)).toEqual([
      'error',
      'delivery_ack',
      'read',
      'server_ack',
    ]);
    expect(merged.map(message => message.text)).toEqual([
      'database a',
      'database b',
      'database c',
      'database d',
    ]);
    expect(snapshot.map(message => message.status)).toEqual([
      'pending',
      'server_ack',
      'pending',
      'server_ack',
    ]);
  });

  it('allows a snapshot to upgrade an optimistic state without downgrading later ACKs', () => {
    const upgraded = mergeOutgoingSnapshotStatuses(
      [{ tempId: 'message-a', status: 'sending' }],
      [{ id: 'message-a', status: 'delivery_ack' }],
    );
    const notDowngraded = mergeOutgoingSnapshotStatuses(
      [{ tempId: 'message-b', status: 'read' }],
      [{ id: 'message-b', status: 'delivery_ack' }],
    );

    expect(upgraded[0].status).toBe('delivery_ack');
    expect(notDowngraded[0].status).toBe('read');
  });

  it('keeps optimistic messages that are not present in an older snapshot yet', () => {
    const current = [
      { tempId: 'persisted', status: 'sending' },
      { tempId: 'just-sent', status: 'error' },
    ];
    const snapshot = [{ id: 'persisted', status: 'pending' }];

    expect(mergeOutgoingSnapshotStatuses(current, snapshot)).toEqual([
      { id: 'persisted', status: 'sending' },
      { tempId: 'just-sent', status: 'error' },
    ]);
  });

  it('creates unique WhatsApp-compatible 3EB0 message IDs', () => {
    const ids = Array.from({ length: 256 }, () => createOutgoingMessageId());

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^3EB0[0-9A-F]{18}$/);
    }
  });
});
