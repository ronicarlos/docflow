import {IAddress} from "@/types/IAdress";
import {GatewayStatus} from "@/types/GatewayStatus";
import {TenantSubscriptionStatus} from "@/types/TenantSubscriptionStatus";
import {TenantPlan} from "@/types/TenantPlan";

export interface ITenant {
  id?: string;
  _id?: string;
  tenantId: string;
  name: string;
  cnpj: string;
  logoUrl?: string;
  address: IAddress;
  commercialPhone?: string;
  commercialEmail?: string;
  plan: TenantPlan;
  subscriptionStatus: TenantSubscriptionStatus;
  subscriptionStartDate: string;
  nextBillingDate: string;
  accountOwner: { name: string; email: string };
  paymentGatewayStatus: GatewayStatus;
  createdAt: string;
  updatedAt: string;
}