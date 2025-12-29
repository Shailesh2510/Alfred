interface ShipdayLocation {
  lat?: number;
  lng?: number;
}

interface ShipdayOrder {
  id?: number;
  order_number?: string;
  provider?: string;
  order_item?: string[];
  delivery_note?: string;
  order_source?: string;
  auto_assignment_status?: string;
  parent_id?: number;
  order_sequence_number?: number;
  total_cost?: number;
  delivery_fee?: number;
  predefined_tip?: number;
  cash_tip?: number;
  discount_amount?: number;
  tax?: number;
  podUrls?: string[];
  driving_duration?: number;
  eta?: string;
  driving_distance?: number;
  placement_time?: number;
  expected_pickup_time?: number;
  expected_delivery_time?: number;
}

interface ShipdayCompany {
  id?: number;
  name?: string;
  description?: string;
  address?: string;
  principal_area_id?: number;
  order_acceptance_timeout?: number;
  average_speed_mps?: number;
  fixed_driver_fee?: number;
  order_activation_time_mins?: number;
  currency_code?: number;
  schedule_order_lead_time_sec?: number;
  max_assigned_order?: number;
  routing?: number;
  country?: number;
  admin_area?: string;
  routing_cost?: string;
}

interface ShipdayDeliveryDetails {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  formatted_address?: string;
  location?: Location;
}

interface ShipdayPickupDetails {
  name?: string;
  phone?: string;
  address?: string;
  formatted_address?: string;
  location?: Location;
}

export interface ShipdayDeliveryStatus {
  timestamp?: number;
  event?: string;
  order_status?: string;
  order?: ShipdayOrder;
  company?: ShipdayCompany;
  delivery_details?: ShipdayDeliveryDetails;
  pickup_details?: ShipdayPickupDetails;
  trackingUrl?: string;
  pods?: any[];
  signatures?: any[];
  delivery_note?: string;
}
