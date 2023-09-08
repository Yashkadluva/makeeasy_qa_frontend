import WebService from "./WebService";

interface PropData {
  Id?: any;
  data?: any;
  user_info?: any;
  is_new?: boolean;
  key?: string;
}

var caches: any = {
  locations: undefined,
  cusId: undefined,
  smId: undefined,
  address: undefined,
  business: undefined,
  sourceCode: undefined,
  serviceType: undefined,
  technician: undefined,
  priceSheet: undefined,
  labels: undefined,
  equipments: undefined,
  terms: undefined,
  zones: undefined,
  sideBars: undefined,
  technicianTrade: undefined,
  setting: undefined,
  taskCode: undefined,
  timePromised : undefined,
  zipCode : undefined,
  state : undefined,
};

export const getServiceMaster = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.Id) {
      WebService.getAPI({
        action: `SDserviceMaster/${props.Id}_${props.user_info["AccountId"]}_${props.user_info["CompanyId"]}`,
        body: null,
      })
        .then((res: any) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    } else {
      reject({});
    }
  });
};

export const getAddress = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (
      props.is_new ||
      props.data.sd_master.SDEquipmentMasters[0].ARCustomerMasterId !=
        caches.cusId
    ) {
      caches.address = undefined;
    }

    if (caches.address) {
      resolve(caches.address);
      return;
    }

    WebService.getAPI({
      action: `SDserviceMaster/GetSmListByArV2/${props.data.sd_master.SDEquipmentMasters[0].ARCustomerMasterId}/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.cusId =
          props.data.sd_master.SDEquipmentMasters[0].ARCustomerMasterId;
        caches.address = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getLocation = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.locations = undefined;
    }

    if (caches.locations) {
      resolve(caches.locations);
      return;
    }

    WebService.getAPI({
      action: `SetupGLBreak/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}/1`,
      body: null,
    })
      .then((res: any) => {
        caches.locations = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getBusiness = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.business = undefined;
    }

    if (caches.business) {
      resolve(caches.business);
      return;
    }

    WebService.getAPI({
      action: `SetupGLBreak/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}/2`,
      body: null,
    })
      .then((res: any) => {
        caches.business = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getSourceCode = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.sourceCode = undefined;
    }

    if (caches.sourceCode) {
      resolve(caches.sourceCode);
      return;
    }

    WebService.getAPI({
      action: `SetupSDSourceCode/GetSetupSDSourceCodes/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.sourceCode = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const updatePreference = (props: PropData) => {
  return new Promise((resolve, reject) => {
    WebService.postAPI({
      action: `SAIUserPreference`,
      body: {
        AccountId: props.user_info["AccountId"],
        CompanyId: props.user_info["CompanyId"],
        UserName: props.user_info["userName"],
        UserId: props.user_info["userID"],
        key: props.key + "_React",
        value: JSON.stringify(props.data),
      },
    })
      .then((res: any) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getPreference = (props: PropData) => {
  return new Promise((resolve, reject) => {
    WebService.getAPI({
      action:
        `SAIUserPreference/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}/${props.user_info["userID"]}/` +
        props.key +
        "_React",
      body: null,
    })
      .then((res: any) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getServiceTypeAll = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.serviceType = undefined;
    }

    if (caches.serviceType) {
      resolve(caches.serviceType);
      return;
    }

    WebService.getAPI({
      action: `SetupSDServiceType/GetAll/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.serviceType = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getTechnician = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.technician = undefined;
    }

    if (caches.technician) {
      resolve(caches.technician);
      return;
    }

    WebService.getAPI({
      action: `SetupSaiSDTechMaster/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.technician = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getPriceSheet = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.priceSheet = undefined;
    }

    if (caches.priceSheet) {
      resolve(caches.priceSheet);
      return;
    }

    WebService.getAPI({
      action: `SetupSDPriceSheet/GetAll/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}/true`,
      body: null,
    })
      .then((res: any) => {
        caches.priceSheet = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getLabels = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.labels = undefined;
    }

    if (caches.labels) {
      resolve(caches.labels);
      return;
    }

    WebService.getAPI({
      action: `SetupGLCompany/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.labels = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getCompanySetting = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.setting = undefined;
    }

    if (caches.setting) {
      resolve(caches.setting);
      return;
    }

    WebService.getAPI({
      action: `SetupSDCompany/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.setting = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getEquipments = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new || props.data.sd_master.Id != caches.smId) {
      caches.equipments = undefined;
    }

    if (caches.equipments) {
      resolve(caches.equipments);
      return;
    }

    WebService.getAPI({
      action:
        "SDEquipmentMaster/GetServiceMasterEquipments/" +
        props.user_info["AccountId"] +
        "/" +
        props.user_info["CompanyId"] +
        "/" +
        props.data.sd_master.Id,
      body: null,
    })
      .then((res: any) => {
        caches.smId = props.data.sd_master.Id;
        caches.equipments = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getTerms = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.terms = undefined;
    }

    if (caches.terms) {
      resolve(caches.terms);
      return;
    }

    WebService.getAPI({
      action:
        "SetupARPaymentTerms/GetActive/" +
        props.user_info["AccountId"] +
        "/" +
        props.user_info["CompanyId"],
      body: null,
    })
      .then((res: any) => {
        caches.terms = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getZone = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.zones = undefined;
    }

    if (caches.zones) {
      resolve(caches.zones);
      return;
    }

    WebService.getAPI({
      action:
        "SetupSDZone/" +
        props.user_info["AccountId"] +
        "/" +
        props.user_info["CompanyId"],
      body: null,
    })
      .then((res: any) => {
        caches.zones = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const sideBarApi = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.sideBars = undefined;
    }

    if (caches.sideBars) {
      resolve(caches.sideBars);
      return;
    }

    WebService.getAPI({
      action:
        "DtoSchema/NavMenu/" +
        props.user_info["AccountId"] +
        "/" +
        props.user_info["CompanyId"] +
        "/en-US",
      body: null,
    })
      .then((res: any) => {
        caches.sideBars = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const clearKey = (key: any) => {
  caches[key] = undefined;
};

export const getTechnicianTrade = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.technicianTrade = undefined;
    }

    if (caches.technicianTrade) {
      resolve(caches.technicianTrade);
      return;
    }

    WebService.getAPI({
      action:
        "SetupSDTechTrade/" +
        props.user_info["AccountId"] +
        "/" +
        props.user_info["CompanyId"] +
        "/true",
      body: null,
    })
      .then((res: any) => {
        caches.technicianTrade = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getTaskCode = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.taskCode = undefined;
    }

    if (caches.taskCode) {
      resolve(caches.taskCode);
      return;
    }

    WebService.getAPI({
      action: `SetupSDProblemTaskCode/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.taskCode = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getTimePromised = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.timePromised = undefined;
    }

    if (caches.timePromised) {
      resolve(caches.timePromised);
      return;
    }

    WebService.getAPI({
      action: `SetupSDTimePromised/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.timePromised = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getZipCode = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.zipCode = undefined;
    }

    if (caches.zipCode) {
      resolve(caches.zipCode);
      return;
    }

    WebService.getAPI({
      action: `SetupSDZipCode/${props.user_info["AccountId"]}/${props.user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        caches.zipCode = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getState = (props: PropData) => {
  return new Promise((resolve, reject) => {
    if (props.is_new) {
      caches.state = undefined;
    }

    if (caches.state) {
      resolve(caches.state);
      return;
    }

    WebService.getAPI({
      action: `SaiSetupState/GetAll/${props.data}`,
      body: null,
    })
      .then((res: any) => {
        caches.state = res;
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
