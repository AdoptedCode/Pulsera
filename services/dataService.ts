
import { Patient, VitalRecord, RiskAnalysis, Appointment, DeviceIntegration } from "../types";
import { INITIAL_PATIENT, MOCK_APPOINTMENTS } from "../constants";
import { analyzePatientRisk } from "./geminiService";

class DataService {
  private patient: Patient;
  private appointments: Appointment[];
  private devices: DeviceIntegration[] = [
    { 
      id: 'apple-health', 
      name: 'Apple Health', 
      provider: 'Apple',
      type: 'App', 
      status: 'Connected', 
      lastSync: '10 mins ago',
      iconBg: 'bg-zinc-900',
      iconColor: 'text-white'
    },
    { 
      id: 'oura', 
      name: 'Oura Ring Gen 3', 
      provider: 'Oura',
      type: 'Wearable', 
      status: 'Connected', 
      lastSync: 'Just now', 
      batteryLevel: 82,
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-900'
    },
    { 
      id: 'dexcom', 
      name: 'Dexcom G7', 
      provider: 'Dexcom',
      type: 'Medical Device', 
      status: 'Connected', 
      lastSync: '5 mins ago',
      batteryLevel: 100,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      id: 'fitbit', 
      name: 'Fitbit Sense', 
      provider: 'Fitbit',
      type: 'Wearable', 
      status: 'Disconnected',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    { 
      id: 'whoop', 
      name: 'Whoop 4.0', 
      provider: 'Whoop',
      type: 'Wearable', 
      status: 'Disconnected',
      iconBg: 'bg-zinc-800',
      iconColor: 'text-white'
    }
  ];

  constructor() {
    // Load patient
    const storedPatient = localStorage.getItem('pulsera_patient');
    this.patient = storedPatient ? JSON.parse(storedPatient) : INITIAL_PATIENT;

    // Load appointments
    const storedApts = localStorage.getItem('pulsera_appointments');
    this.appointments = storedApts ? JSON.parse(storedApts) : (MOCK_APPOINTMENTS as Appointment[]);
  }

  getPatient(): Patient {
    return this.patient;
  }

  getAppointments(): Appointment[] {
    return this.appointments;
  }

  getDevices(): DeviceIntegration[] {
    return this.devices;
  }

  async toggleDeviceConnection(id: string): Promise<DeviceIntegration[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    this.devices = this.devices.map(d => {
        if (d.id === id) {
            const isConnected = d.status === 'Connected';
            return {
                ...d,
                status: isConnected ? 'Disconnected' : 'Connected',
                lastSync: isConnected ? undefined : 'Just now',
                batteryLevel: isConnected ? undefined : Math.floor(Math.random() * 40) + 60
            };
        }
        return d;
    });
    return [...this.devices];
  }

  async syncAllDevices(): Promise<DeviceIntegration[]> {
    // Simulate syncing connected devices
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.devices = this.devices.map(d => {
        if (d.status === 'Connected') {
            return { ...d, lastSync: 'Just now' };
        }
        return d;
    });
    return [...this.devices];
  }

  async addAppointment(apt: Appointment): Promise<Appointment[]> {
    this.appointments = [apt, ...this.appointments];
    this.save();
    return this.appointments;
  }

  async removeAppointment(id: string | number): Promise<Appointment[]> {
    this.appointments = this.appointments.filter(a => a.id !== id);
    this.save();
    return this.appointments;
  }

  async addVitalRecord(record: Omit<VitalRecord, 'id' | 'timestamp'>): Promise<Patient> {
    const newRecord: VitalRecord = {
      ...record,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...this.patient.vitalsHistory, newRecord];
    const tempPatient = { ...this.patient, vitalsHistory: updatedHistory };

    const analysis: RiskAnalysis = await analyzePatientRisk(tempPatient, newRecord);

    this.patient = {
      ...tempPatient,
      currentRisk: analysis
    };

    this.save();
    return this.patient;
  }

  async processHospitalUpload(file: File): Promise<Patient> {
    await new Promise(r => setTimeout(r, 1500));

    const mockExtractedRecord: VitalRecord = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      source: 'HOSPITAL_UPLOAD',
      systolic: 135,
      diastolic: 88,
      heartRate: 80,
      notes: `Extracted from ${file.name}: Routine Checkup.`
    };

     const updatedHistory = [...this.patient.vitalsHistory, mockExtractedRecord];
     const tempPatient = { ...this.patient, vitalsHistory: updatedHistory };
     const analysis: RiskAnalysis = await analyzePatientRisk(tempPatient, mockExtractedRecord);
 
     this.patient = {
       ...tempPatient,
       currentRisk: analysis
     };
     
     this.save();
     return this.patient;
  }

  private save() {
    localStorage.setItem('pulsera_patient', JSON.stringify(this.patient));
    localStorage.setItem('pulsera_appointments', JSON.stringify(this.appointments));
  }
}

export const dataService = new DataService();
