import SystemSetting from "../models/SystemSetting.js";
import { COMPANY_DEFAULTS } from "../config/companyDefaults.js";

const DEFAULTS = COMPANY_DEFAULTS;

export async function getSystemSettings(){

  let settings =
    await SystemSetting.findOne({
      key:"default"
    }).lean();

  if(!settings){

    settings =
      await SystemSetting.create({
        key:"default",
        ...DEFAULTS
      });

    settings =
      settings.toObject();
  }

  return settings;
}
