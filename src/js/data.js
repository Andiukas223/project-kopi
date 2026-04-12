// ---------------------------------------------------------------------------
// All system roles. The first three (service, sales, admin) are shown in the
// header role-switcher for prototype convenience. The full list drives the
// Admin permission grid.
// ---------------------------------------------------------------------------
export const roles = [
  { id: "service",   label: "Service workspace",    description: "Service engineers: create cases, log diagnostics/repair, upload signed documents." },
  { id: "svcmgr",   label: "Service Mgr workspace", description: "Service Manager: approves parts requests, assigns and controls engineers." },
  { id: "sales",     label: "Sales workspace",       description: "Sales: commercial offers, contracts, customer approval, invoice upload." },
  { id: "finance",   label: "Finance workspace",     description: "Finance: generates/uploads invoices, manages payment status (paid/pending/canceled)." },
  { id: "office",    label: "Office Mgr workspace",  description: "Office Manager: customer registry, contacts, calendar, case creation, reminders." },
  { id: "logistics", label: "Logistics workspace",   description: "Logistics Manager: parts delivery, vendor returns, logistics issue resolution." },
  { id: "warehouse", label: "Warehouse workspace",   description: "Warehouse: stock confirmation, parts arrival, inventory management." },
  { id: "manager",   label: "Manager workspace",     description: "Manager: read-only overview across all modules and reports." },
  { id: "admin",     label: "Admin workspace",       description: "Admin: full control, user permissions, workflow config, case close, contract archive management." }
];

// Permission definitions — used by the Admin page permission grid.
export const allPermissions = [
  { id: "createCase",       label: "Create service case" },
  { id: "viewAllDocs",      label: "View all documents" },
  { id: "approveParts",     label: "Approve parts requests" },
  { id: "manageContracts",  label: "Manage contracts" },
  { id: "viewAllCalendar",  label: "View all calendars" },
  { id: "assignWork",       label: "Assign work to users" },
  { id: "closeCases",       label: "Close and archive cases" },
  { id: "editArchivedDocs", label: "Edit archived documents" },
  { id: "generateInvoice",  label: "Generate and upload invoices" },
  { id: "configSystem",     label: "Configure system settings" }
];

// ---------------------------------------------------------------------------
// Users with role assignments and per-user permission overrides.
// ---------------------------------------------------------------------------
export const users = [
  {
    id: "u1",
    name: "Rokas Petrauskas",
    initials: "RP",
    roles: ["service"],
    permissions: {
      createCase: true,  viewAllDocs: false, approveParts: false, manageContracts: false,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u2",
    name: "Marius Vaitkus",
    initials: "MV",
    roles: ["service", "svcmgr"],
    permissions: {
      createCase: true,  viewAllDocs: true,  approveParts: true, manageContracts: false,
      viewAllCalendar: true, assignWork: true, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u3",
    name: "Aurelija Jankauske",
    initials: "AJ",
    roles: ["service"],
    permissions: {
      createCase: true,  viewAllDocs: false, approveParts: false, manageContracts: false,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u4",
    name: "Vita Klimaite",
    initials: "VK",
    roles: ["sales", "finance"],
    permissions: {
      createCase: false, viewAllDocs: true,  approveParts: false, manageContracts: true,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: true, configSystem: false
    }
  },
  {
    id: "u5",
    name: "Ingrida Mazure",
    initials: "IM",
    roles: ["office"],
    permissions: {
      createCase: true,  viewAllDocs: true,  approveParts: false, manageContracts: false,
      viewAllCalendar: true, assignWork: true, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u6",
    name: "Tomas Gruodis",
    initials: "TG",
    roles: ["logistics", "warehouse"],
    permissions: {
      createCase: false, viewAllDocs: false, approveParts: false, manageContracts: false,
      viewAllCalendar: false, assignWork: false, closeCases: false, editArchivedDocs: false,
      generateInvoice: false, configSystem: false
    }
  },
  {
    id: "u7",
    name: "Admin Viva Medical",
    initials: "AD",
    roles: ["admin"],
    permissions: {
      createCase: true,  viewAllDocs: true,  approveParts: true, manageContracts: true,
      viewAllCalendar: true, assignWork: true, closeCases: true, editArchivedDocs: true,
      generateInvoice: true, configSystem: true
    }
  }
];

// ---------------------------------------------------------------------------
// Customers — hospitals, clinics, and private medical institutions.
// ---------------------------------------------------------------------------
export const customers = [
  {
    id: "CUST-01",
    name: "Vilnius Clinical Hospital",
    shortCode: "VCH",
    type: "Hospital",
    contact: "Jonas Kazlauskas",
    contactRole: "Biomedical Engineer",
    email: "j.kazlauskas@vch.lt",
    phone: "+370 5 236 5555",
    address: "Šiltnamių g. 29, LT-04130 Vilnius",
    openJobs: 3,
    equipmentCount: 5,
    outstandingDocs: 2,
    activeContracts: 2
  },
  {
    id: "CUST-02",
    name: "Baltic Cardio Center",
    shortCode: "BCC",
    type: "Clinic",
    contact: "Rima Vaitkiene",
    contactRole: "Technical Manager",
    email: "r.vaitkiene@bcc.lt",
    phone: "+370 5 250 0100",
    address: "Pamenkalnio g. 5, LT-01114 Vilnius",
    openJobs: 1,
    equipmentCount: 2,
    outstandingDocs: 1,
    activeContracts: 1
  },
  {
    id: "CUST-03",
    name: "Kaunas Diagnostics",
    shortCode: "KDX",
    type: "Diagnostics Center",
    contact: "Arturas Jonaitis",
    contactRole: "IT Administrator",
    email: "a.jonaitis@kdx.lt",
    phone: "+370 37 321 000",
    address: "Jonavos g. 2, LT-44192 Kaunas",
    openJobs: 1,
    equipmentCount: 3,
    outstandingDocs: 1,
    activeContracts: 1
  },
  {
    id: "CUST-04",
    name: "Northway Clinic",
    shortCode: "NWC",
    type: "Private Clinic",
    contact: "Laura Bakiene",
    contactRole: "Equipment Coordinator",
    email: "l.bakiene@northway.lt",
    phone: "+370 5 264 4466",
    address: "Visorių g. 1, LT-08300 Vilnius",
    openJobs: 1,
    equipmentCount: 2,
    outstandingDocs: 1,
    activeContracts: 1
  }
];

// ---------------------------------------------------------------------------
// Installed systems (equipment). One record per physical unit.
// supportEnabled drives the Support Portal feature — when true, unique URLs
// are generated for hospital staff to report faults without logging in.
// ---------------------------------------------------------------------------
export const equipment = [
  {
    id: "EQ-501",
    name: "ARIETTA 850 DeepInsight",
    manufacturer: "GE Healthcare",
    category: "Ultrasound",
    customer: "Vilnius Clinical Hospital",
    customerId: "CUST-01",
    serial: "US-850-0192",
    partNumber: "US-850-PN-01",
    idGE: "GE-0192",
    location: "Radiology Dept, Room 204",
    installedDate: "2024-03-15",
    yearOfManufacture: "2023",
    sellerInvoice: "INV-2024-0312",
    warrantyEndManufacturer: "2027-03-15",
    warrantyEndHospital: "2026-03-15",
    acceptanceDate: "2024-03-20",
    acceptanceInvoice: "ACC-2024-0320",
    status: "Under service",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "VCH Radiology",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "support@gehealthcare.com",
      hospital: "biomed@vch.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/US-850-0192",
      hospital: "https://support.vivamedical.lt/h/vch",
      group: "https://support.vivamedical.lt/g/vch-radiology"
    }
  },
  {
    id: "EQ-502",
    name: "WASSENBURG WD440 Endoscope Washer",
    manufacturer: "Wassenburg Medical",
    category: "Endoscopy",
    customer: "Kaunas Diagnostics",
    customerId: "CUST-03",
    serial: "WB-7720",
    partNumber: "WD440-PN-03",
    idGE: "",
    location: "Endoscopy Unit, Floor 2",
    installedDate: "2023-07-10",
    yearOfManufacture: "2023",
    sellerInvoice: "INV-2023-0710",
    warrantyEndManufacturer: "2026-07-10",
    warrantyEndHospital: "2025-07-10",
    acceptanceDate: "2023-07-15",
    acceptanceInvoice: "ACC-2023-0715",
    status: "Parts pending",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "KDX Endoscopy",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "service@wassenburg.com",
      hospital: "tech@kdx.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/WB-7720",
      hospital: "https://support.vivamedical.lt/h/kdx",
      group: "https://support.vivamedical.lt/g/kdx-endoscopy"
    }
  },
  {
    id: "EQ-503",
    name: "ARJO Maxi Move Patient Lift",
    manufacturer: "ARJO",
    category: "Patient Handling",
    customer: "Northway Clinic",
    customerId: "CUST-04",
    serial: "ARJ-2190",
    partNumber: "ARJO-MM-PN",
    idGE: "",
    location: "Rehabilitation Ward",
    installedDate: "2022-11-01",
    yearOfManufacture: "2022",
    sellerInvoice: "INV-2022-1101",
    warrantyEndManufacturer: "2025-11-01",
    warrantyEndHospital: "2024-11-01",
    acceptanceDate: "2022-11-05",
    acceptanceInvoice: "ACC-2022-1105",
    status: "Final check",
    isDemo: false,
    isOutdated: false,
    supportEnabled: false,
    supportGroupName: "",
    supportEmails: { company: "", manufacturer: "", hospital: "" },
    webLinks: { system: "", hospital: "", group: "" }
  },
  {
    id: "EQ-504",
    name: "COR-KNOT Device",
    manufacturer: "LSI Solutions",
    category: "Cardiac Surgery",
    customer: "Baltic Cardio Center",
    customerId: "CUST-02",
    serial: "CK-4418",
    partNumber: "CK-PN-4418",
    idGE: "",
    location: "OR Suite 1",
    installedDate: "2025-01-20",
    yearOfManufacture: "2024",
    sellerInvoice: "INV-2025-0120",
    warrantyEndManufacturer: "2028-01-20",
    warrantyEndHospital: "2027-01-20",
    acceptanceDate: "2025-01-22",
    acceptanceInvoice: "ACC-2025-0122",
    status: "Active",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "BCC Cardiac",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "support@lsisolutions.com",
      hospital: "tech@bcc.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/CK-4418",
      hospital: "https://support.vivamedical.lt/h/bcc",
      group: "https://support.vivamedical.lt/g/bcc-cardiac"
    }
  },
  {
    id: "EQ-505",
    name: "ARIETTA 750 BioSound",
    manufacturer: "GE Healthcare",
    category: "Ultrasound",
    customer: "Vilnius Clinical Hospital",
    customerId: "CUST-01",
    serial: "US-750-0041",
    partNumber: "US-750-PN-01",
    idGE: "GE-0041",
    location: "Cardiology Dept, Room 108",
    installedDate: "2023-09-01",
    yearOfManufacture: "2023",
    sellerInvoice: "INV-2023-0901",
    warrantyEndManufacturer: "2026-09-01",
    warrantyEndHospital: "2025-09-01",
    acceptanceDate: "2023-09-05",
    acceptanceInvoice: "ACC-2023-0905",
    status: "Active",
    isDemo: false,
    isOutdated: false,
    supportEnabled: true,
    supportGroupName: "VCH Radiology",
    supportEmails: {
      company: "service@vivamedical.lt",
      manufacturer: "support@gehealthcare.com",
      hospital: "biomed@vch.lt"
    },
    webLinks: {
      system: "https://support.vivamedical.lt/s/US-750-0041",
      hospital: "https://support.vivamedical.lt/h/vch",
      group: "https://support.vivamedical.lt/g/vch-radiology"
    }
  }
];

// ---------------------------------------------------------------------------
// Service contracts. Each repair on a service contract deducts from
// the remaining balance. The system warns when repair cost exceeds remaining.
// ---------------------------------------------------------------------------
export const contracts = [
  {
    id: "CTR-101",
    type: "Service",
    customer: "Vilnius Clinical Hospital",
    customerId: "CUST-01",
    equipment: "ARIETTA 850 DeepInsight",
    equipmentId: "EQ-501",
    value: 45000,
    consumed: 6500,
    remaining: 38500,
    currency: "EUR",
    start: "2025-01-01",
    end: "2027-12-31",
    status: "Active",
    pmPerYear: 2,
    notes: "Covers preventive maintenance and repairs. Parts not included above agreed threshold."
  },
  {
    id: "CTR-102",
    type: "PM",
    customer: "Kaunas Diagnostics",
    customerId: "CUST-03",
    equipment: "WASSENBURG WD440 Endoscope Washer",
    equipmentId: "EQ-502",
    value: 8000,
    consumed: 2000,
    remaining: 6000,
    currency: "EUR",
    start: "2025-04-01",
    end: "2026-03-31",
    status: "Active",
    pmPerYear: 4,
    notes: "Quarterly preventive maintenance. Emergency call-outs billed separately."
  },
  {
    id: "CTR-103",
    type: "Service",
    customer: "Baltic Cardio Center",
    customerId: "CUST-02",
    equipment: "COR-KNOT Device",
    equipmentId: "EQ-504",
    value: 12000,
    consumed: 0,
    remaining: 12000,
    currency: "EUR",
    start: "2025-02-01",
    end: "2026-01-31",
    status: "Active",
    pmPerYear: 2,
    notes: "Full service coverage including parts replacement up to €3,000 per incident."
  }
];

// ---------------------------------------------------------------------------
// Parts requests. Flows from Engineer → Service Manager approval →
// Logistics/Warehouse fulfillment → delivery decision → repair proceeds.
// ---------------------------------------------------------------------------
export const partsRequests = [
  {
    id: "PR-201",
    jobId: "VM-SV-1026",
    equipment: "WASSENBURG WD440 Endoscope Washer",
    part: "Valve assembly VAL-7720",
    partNumber: "WD-VAL-7720",
    quantity: 1,
    description: "Main inlet valve leaking during wash cycle. Needs immediate replacement to unblock repair.",
    status: "Pending approval",
    requestedBy: "A. Jankauske",
    approvedBy: null,
    edd: "2026-04-20",
    delivery: null,
    deliveryAddress: null,
    deliveryContact: null
  },
  {
    id: "PR-202",
    jobId: "VM-SV-1024",
    equipment: "ARIETTA 850 DeepInsight",
    part: "Transducer cable C1-5-D",
    partNumber: "GE-C1-5D-CBL",
    quantity: 1,
    description: "Transducer cable damaged during diagnostics check. System cannot complete scan.",
    status: "Approved",
    requestedBy: "R. Petrauskas",
    approvedBy: "M. Vaitkus",
    edd: "2026-04-18",
    delivery: null,
    deliveryAddress: null,
    deliveryContact: null
  },
  {
    id: "PR-203",
    jobId: "VM-SV-1025",
    equipment: "COR-KNOT Device",
    part: "Actuator spring set AS-CK4",
    partNumber: "CK-SPRING-SET",
    quantity: 2,
    description: "Springs worn after extended use. Required for quotation repair scope.",
    status: "In transit",
    requestedBy: "M. Vaitkus",
    approvedBy: "M. Vaitkus",
    edd: "2026-04-16",
    delivery: "Deliver to site",
    deliveryAddress: "Pamenkalnio g. 5, LT-01114 Vilnius",
    deliveryContact: "Rima Vaitkiene — +370 5 250 0100"
  },
  {
    id: "PR-204",
    jobId: "VM-SV-1027",
    equipment: "ARJO Maxi Move Patient Lift",
    part: "Battery pack ARJO-BP-220",
    partNumber: "ARJO-BP-220",
    quantity: 1,
    description: "Battery degraded, lift cannot hold charge for full session.",
    status: "Arrived at warehouse",
    requestedBy: "R. Petrauskas",
    approvedBy: "M. Vaitkus",
    edd: "2026-04-13",
    delivery: null,
    deliveryAddress: null,
    deliveryContact: null
  }
];

// ---------------------------------------------------------------------------
// Service jobs
// ---------------------------------------------------------------------------
export const jobs = [
  {
    id: "VM-SV-1024",
    customer: "Vilnius Clinical Hospital",
    equipment: "ARIETTA 850 DeepInsight",
    serial: "US-850-0192",
    owner: "R. Petrauskas",
    priority: "High",
    stage: "Diagnostics",
    status: "Open",
    due: "2026-04-15",
    documentStatus: "Draft"
  },
  {
    id: "VM-SV-1025",
    customer: "Baltic Cardio Center",
    equipment: "COR-KNOT Device",
    serial: "CK-4418",
    owner: "M. Vaitkus",
    priority: "Normal",
    stage: "Waiting for quotation",
    status: "Pending",
    due: "2026-04-17",
    documentStatus: "Review"
  },
  {
    id: "VM-SV-1026",
    customer: "Kaunas Diagnostics",
    equipment: "WASSENBURG WD440 Endoscope Washer",
    serial: "WB-7720",
    owner: "A. Jankauske",
    priority: "High",
    stage: "Parts pending",
    status: "Blocked",
    due: "2026-04-14",
    documentStatus: "Customer"
  },
  {
    id: "VM-SV-1027",
    customer: "Northway Clinic",
    equipment: "ARJO Maxi Move Patient Lift",
    serial: "ARJ-2190",
    owner: "R. Petrauskas",
    priority: "Normal",
    stage: "Final documents",
    status: "Open",
    due: "2026-04-19",
    documentStatus: "Signature"
  }
];

// ---------------------------------------------------------------------------
// Documents pipeline
// ---------------------------------------------------------------------------
export const documents = [
  {
    id: "DOC-3108",
    type: "Service act",
    jobId: "VM-SV-1024",
    customer: "Vilnius Clinical Hospital",
    owner: "Service",
    status: "Draft",
    due: "2026-04-15",
    pipelineStep: "Draft"
  },
  {
    id: "DOC-3109",
    type: "Quotation",
    jobId: "VM-SV-1025",
    customer: "Baltic Cardio Center",
    owner: "Sales",
    status: "Review",
    due: "2026-04-11",
    pipelineStep: "Review"
  },
  {
    id: "DOC-3110",
    type: "Parts request",
    jobId: "VM-SV-1026",
    customer: "Kaunas Diagnostics",
    owner: "Service",
    status: "Customer",
    due: "2026-04-10",
    pipelineStep: "Customer"
  },
  {
    id: "DOC-3111",
    type: "Acceptance report",
    jobId: "VM-SV-1027",
    customer: "Northway Clinic",
    owner: "Admin",
    status: "Signature",
    due: "2026-04-19",
    pipelineStep: "Signature"
  }
];

// ---------------------------------------------------------------------------
// Document templates (Carbone mock — real generation is backend phase 4B)
// ---------------------------------------------------------------------------
export const templates = [
  { id: "tpl-service-act",  name: "Service act",        format: "ODT/DOCX/PDF", owner: "Service" },
  { id: "tpl-diagnostic",   name: "Diagnostic report",  format: "ODT/DOCX/PDF", owner: "Service" },
  { id: "tpl-quotation",    name: "Quotation",           format: "DOCX/PDF",     owner: "Sales"   },
  { id: "tpl-acceptance",   name: "Acceptance report",  format: "ODT/PDF",      owner: "Admin"   },
  { id: "tpl-vendor-return",name: "Vendor return note", format: "DOCX/PDF",     owner: "Service" }
];

// ---------------------------------------------------------------------------
// Pipeline stages for document pipeline board
// ---------------------------------------------------------------------------
export const pipelineStages = ["Draft", "Review", "Customer", "Signature", "Approved", "Archived"];

// ---------------------------------------------------------------------------
// Manual calendar events (sales meetings, demos, logistics).
// PM visits are auto-generated from contracts in render.js.
// ---------------------------------------------------------------------------
export const calendarEvents = [
  { id: "EV-01", date: "2026-04-08", title: "Sales demo — VCH ultrasound",  type: "sales",     userId: "u4" },
  { id: "EV-02", date: "2026-04-10", title: "Meeting — Baltic Cardio",       type: "sales",     userId: "u4" },
  { id: "EV-03", date: "2026-04-14", title: "Parts delivery KDX",            type: "logistics", userId: "u6" },
  { id: "EV-04", date: "2026-04-16", title: "PM visit — VCH ARIETTA 850",    type: "pm",        userId: "u1" },
  { id: "EV-05", date: "2026-04-20", title: "PM visit — KDX WASSENBURG",     type: "pm",        userId: "u3" },
  { id: "EV-06", date: "2026-04-23", title: "Contract review — CTR-101",     type: "contract",  userId: "u5" },
  { id: "EV-07", date: "2026-04-25", title: "New system demo — Northway",    type: "sales",     userId: "u4" }
];
