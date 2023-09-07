import { DIAGNOSTIC_ENDPOINT } from '../src/constants';
import { Diagnostic } from '../src/diagnostic';

jest.useFakeTimers();

describe('Diagnostic', () => {
  let diagnostic: Diagnostic;
  const eventCount = 5;
  const code = 200;
  const delay = 60000;

  beforeEach(() => {
    diagnostic = new Diagnostic();
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocked functions after each test
  });

  describe('constructor', () => {
    test('should set serverUrl to default value if not provided', () => {
      expect(diagnostic.serverUrl).toBe(DIAGNOSTIC_ENDPOINT);
    });

    test('should set serverUrl to provided value', () => {
      const serverUrl = 'https://test.com';
      diagnostic = new Diagnostic(serverUrl);

      expect(diagnostic.serverUrl).toBe(serverUrl);
    });
  });

  describe('track', () => {
    test('should add events to the queue when track method is called', () => {
      diagnostic.track(eventCount, code, 'Test message');

      expect(diagnostic.queue).toHaveLength(1);
      expect(diagnostic.queue[0].event_properties.event_count).toBe(eventCount);
      expect(diagnostic.queue[0].event_properties.response_error_code).toBe(code);
      expect(diagnostic.queue[0].event_properties.trigger).toBe('Test message');
      expect(diagnostic.queue[0].library).toBe('diagnostic-test-library');
    });

    test('should schedule flush when track is called for the first time 0', () => {
      const setTimeoutMock = jest.spyOn(global, 'setTimeout');

      diagnostic.track(eventCount, code, 'Test message');

      jest.advanceTimersByTime(delay);
      expect(setTimeoutMock).toHaveBeenCalledTimes(1);
      expect(setTimeoutMock.mock.calls[0][0]).toBeInstanceOf(Function);
      expect(setTimeoutMock.mock.calls[0][1]).toBe(delay);
      setTimeoutMock.mockRestore();
    });
  });

  describe('flush', () => {
    test('should clear scheduled timeout when flush is called', async () => {
      const clearTimeoutMock = jest.spyOn(global, 'clearTimeout');
      const setTimeoutMock = jest.spyOn(global, 'setTimeout');

      diagnostic.track(eventCount, code, 'Scheduled timeout test');
      await diagnostic.flush();

      expect(setTimeoutMock).toHaveBeenCalledTimes(1);
      expect(clearTimeoutMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestPayloadBuilder', () => {
    test('should return correct payload', () => {
      const events = [
        {
          time: Date.now(),
          event_properties: {
            response_error_code: code,
            trigger: 'test trigger',
            action: 'test action',
            event_count: eventCount,
          },
          library: 'diagnostic-test-library',
        },
      ];

      const expectedPayload = {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        events: events,
        method: 'POST',
      };

      expect(diagnostic.requestPayloadBuilder(events)).toEqual(expectedPayload);
    });
  });

  describe('execute', () => {
    test('should not be called, use track() instead', async () => {
      const context = { event_type: 'custom event' };

      const result = await diagnostic.execute(context);

      expect(result.message).toBe('this method should not be called, use track() instead');
    });
  });
});
