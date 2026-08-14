import SystemSetting from "../models/SystemSetting.js";

const DEFAULTS = {
  companyName:"Coherent Tours",
  currency:"KES",
  currencySymbol:"KSh",
  timezone:"Africa/Nairobi"
};

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
