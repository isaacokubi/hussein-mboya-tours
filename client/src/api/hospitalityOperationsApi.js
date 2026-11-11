/**
 * Purpose: hospitality Operations Api client application module. Main declarations: unwrap, getHospitalityDashboard, getHotelCalendar, getHotelPerformance, amendHotelBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";
// Declare unwrap for use by the surrounding module or function.
const unwrap=r=>r?.data?.data??r?.data??[];
// Declare getHospitalityDashboard for use by the surrounding module or function.
export const getHospitalityDashboard=()=>api.get("/admin/hospitality-operations/dashboard").then(unwrap);
// Declare getHotelCalendar for use by the surrounding module or function.
export const getHotelCalendar=(params={})=>api.get("/admin/hospitality-operations/hotels/calendar",{params}).then(unwrap);
// Declare getHotelPerformance for use by the surrounding module or function.
export const getHotelPerformance=(params={})=>api.get("/admin/hospitality-operations/hotels/performance",{params}).then(unwrap);
// Declare amendHotelBooking for use by the surrounding module or function.
export const amendHotelBooking=(id,payload)=>api.patch(`/admin/hospitality-operations/hotels/bookings/${id}/amend`,payload).then(unwrap);
// Declare cancelHotelBooking for use by the surrounding module or function.
export const cancelHotelBooking=(id,payload={})=>api.patch(`/admin/hospitality-operations/hotels/bookings/${id}/cancel`,payload).then(unwrap);
// Declare blockRooms for use by the surrounding module or function.
export const blockRooms=payload=>api.post("/admin/hospitality-operations/hotels/room-blocks",payload).then(unwrap);
// Declare releaseRoomBlock for use by the surrounding module or function.
export const releaseRoomBlock=id=>api.patch(`/admin/hospitality-operations/hotels/room-blocks/${id}/release`).then(unwrap);
// Declare getRatePlans for use by the surrounding module or function.
export const getRatePlans=(params={})=>api.get("/admin/hospitality-operations/rate-plans",{params}).then(unwrap);
// Declare createRatePlan for use by the surrounding module or function.
export const createRatePlan=payload=>api.post("/admin/hospitality-operations/rate-plans",payload).then(unwrap);
// Declare updateRatePlan for use by the surrounding module or function.
export const updateRatePlan=(id,payload)=>api.patch(`/admin/hospitality-operations/rate-plans/${id}`,payload).then(unwrap);
// Declare getSupplierContracts for use by the surrounding module or function.
export const getSupplierContracts=(params={})=>api.get("/admin/hospitality-operations/suppliers/contracts",{params}).then(unwrap);
// Declare createSupplierContract for use by the surrounding module or function.
export const createSupplierContract=payload=>api.post("/admin/hospitality-operations/suppliers/contracts",payload).then(unwrap);
// Declare updateSupplierContract for use by the surrounding module or function.
export const updateSupplierContract=(id,payload)=>api.patch(`/admin/hospitality-operations/suppliers/contracts/${id}`,payload).then(unwrap);
// Declare getHospitalityDeposits for use by the surrounding module or function.
export const getHospitalityDeposits=(params={})=>api.get("/admin/hospitality-operations/deposits",{params}).then(unwrap);
// Declare getHospitalityRoomBlocks for use by the surrounding module or function.
export const getHospitalityRoomBlocks=(params={})=>api.get("/admin/hospitality-operations/hotels/room-blocks",{params}).then(unwrap);
// Declare createHospitalityDeposit for use by the surrounding module or function.
export const createHospitalityDeposit=payload=>api.post("/admin/hospitality-operations/deposits",payload).then(unwrap);
// Declare updateHospitalityDeposit for use by the surrounding module or function.
export const updateHospitalityDeposit=(id,payload)=>api.patch(`/admin/hospitality-operations/deposits/${id}`,payload).then(unwrap);
// Declare getTransferDispatch for use by the surrounding module or function.
export const getTransferDispatch=(params={})=>api.get("/admin/hospitality-operations/transfers/dispatch",{params}).then(unwrap);
// Declare assignTransfer for use by the surrounding module or function.
export const assignTransfer=(id,payload)=>api.patch(`/admin/hospitality-operations/transfers/${id}/assign`,payload).then(unwrap);
// Declare updateTransferStatus for use by the surrounding module or function.
export const updateTransferStatus=(id,payload)=>api.patch(`/admin/hospitality-operations/transfers/${id}/status`,payload).then(unwrap);
// Declare getHospitalityPaymentReconciliation for use by the surrounding module or function.
export const getHospitalityPaymentReconciliation=(params={})=>api.get("/admin/hospitality-operations/payments/reconciliation",{params}).then(unwrap);
// Declare getHospitalityDrivers for use by the surrounding module or function.
export const getHospitalityDrivers=()=>api.get("/admin/hospitality-operations/drivers").then(unwrap);
// Declare getHospitalityVehicles for use by the surrounding module or function.
export const getHospitalityVehicles=()=>api.get("/admin/hospitality-operations/vehicles").then(unwrap);
