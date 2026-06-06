import { SimulationService } from './simulation';
import { MachineService } from './machineService';
import { AlertService } from './alertService';
import { MaintenanceService } from './maintenanceService';
import { DashboardService } from './dashboardService';

export class ServiceContainer {
  public simulationService: SimulationService;
  public machineService: MachineService;
  public alertService: AlertService;
  public maintenanceService: MaintenanceService;
  public dashboardService: DashboardService;

  constructor(simulationService: SimulationService) {
    this.simulationService = simulationService;
    this.machineService = new MachineService(simulationService);
    this.alertService = new AlertService();
    this.maintenanceService = new MaintenanceService();
    this.dashboardService = new DashboardService(simulationService);
  }
}
