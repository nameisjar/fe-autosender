import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

// Mock the http module before importing the composable
vi.mock('../../api/http.js', () => ({
  userApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../api/socket.js', () => ({
  listenToDeviceStatus: vi.fn(),
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}));

import { useDevices } from '../../composables/useDevices.js';
import { userApi } from '../../api/http.js';

describe('useDevices Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  describe('loadDevices', () => {
    it('should load devices and set default selection', async () => {
      const mockDevices = [
        { id: 'device-1', name: 'Device 1', status: 'open' },
        { id: 'device-2', name: 'Device 2', status: 'close' },
      ];

      userApi.get.mockResolvedValue({ data: mockDevices });

      const { loadDevices, devices, selectedDeviceId } = useDevices();
      await loadDevices();

      expect(userApi.get).toHaveBeenCalledWith('/devices');
      expect(devices.value).toEqual(mockDevices);
      expect(selectedDeviceId.value).toBe('device-1');
    });

    it('should keep existing selection if device exists', async () => {
      const mockDevices = [
        { id: 'device-1', name: 'Device 1', status: 'close' },
        { id: 'device-2', name: 'Device 2', status: 'open' },
      ];

      localStorage.getItem.mockReturnValue('device-2');
      userApi.get.mockResolvedValue({ data: mockDevices });

      const { loadDevices, selectedDeviceId } = useDevices();
      await loadDevices();

      expect(selectedDeviceId.value).toBe('device-2');
    });

    it('should handle empty device list', async () => {
      userApi.get.mockResolvedValue({ data: [] });

      const { loadDevices, devices, selectedDeviceId } = useDevices();
      await loadDevices();

      expect(devices.value).toEqual([]);
      expect(selectedDeviceId.value).toBe('');
    });

    it('should handle API errors gracefully', async () => {
      userApi.get.mockRejectedValue(new Error('Network error'));

      const { loadDevices, devices } = useDevices();
      await loadDevices();

      expect(devices.value).toEqual([]);
    });
  });

  describe('selectDevice', () => {
    it('should update selected device', async () => {
      const mockDevices = [
        { id: 'device-1', name: 'Device 1', status: 'open' },
        { id: 'device-2', name: 'Device 2', status: 'close' },
      ];

      userApi.get.mockResolvedValue({ data: mockDevices });

      const { loadDevices, selectDevice, selectedDeviceId } = useDevices();
      await loadDevices();

      selectDevice('device-2');

      expect(selectedDeviceId.value).toBe('device-2');
      expect(localStorage.setItem).toHaveBeenCalledWith('device_selected_id', 'device-2');
    });
  });

  describe('selectedDevice computed', () => {
    it('should return the selected device object', async () => {
      const mockDevices = [
        { id: 'device-1', name: 'Device 1', status: 'open' },
        { id: 'device-2', name: 'Device 2', status: 'close' },
      ];

      userApi.get.mockResolvedValue({ data: mockDevices });

      const { loadDevices, selectDevice, selectedDevice } = useDevices();
      await loadDevices();

      selectDevice('device-2');

      // Check key properties exist
      expect(selectedDevice.value.id).toBe('device-2');
      expect(selectedDevice.value.name).toBe('Device 2');
      expect(selectedDevice.value.status).toBe('close');
    });

    it('should return null/undefined when no device is selected', async () => {
      userApi.get.mockResolvedValue({ data: [] });

      const { loadDevices, selectedDevice } = useDevices();
      await loadDevices();

      // Can be null or undefined depending on implementation
      expect(selectedDevice.value == null).toBe(true);
    });
  });
});
