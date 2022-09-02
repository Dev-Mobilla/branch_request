// const getUserById = "SELECT BranchCode, ZoneCode, fullname FROM branchusers WHERE ResourceID = ?";
//KPUSERS
const getByBranchCodeZoneCode = "SELECT regionname, areaname, branchname FROM branches WHERE BranchCode = ? AND zonecode = ?";
const getUserById = "SELECT bu.BranchCode, bu.ZoneCode, bu.fullname,su.EmailAddress, su.RoleID FROM sysuseraccounts su INNER JOIN branchusers bu ON bu.ResourceID = su.ResourceID WHERE bu.ResourceID = ?";
const getUserByEmail = "SELECT bu.ResourceID, bu.BranchCode, bu.ZoneCode, bu.fullname,su.EmailAddress, su.RoleID FROM sysuseraccounts su INNER JOIN branchusers bu ON bu.ResourceID = su.ResourceID WHERE su.EmailAddress = ?"
//BRANCH_REQUEST
const postRequest = "INSERT INTO cash_advance_request (idNumber, author,jobTitle, branch,area,region,email,purpose,controlNo,date,travelDate,departureDate,arrivalDate,amount,area_approver,am_status,am_date,regional_approver,rm_status,rm_date,ram_approver,ram_status, ram_date,ass_vpo_approver,ass_status,ass_date,vpo_approver,vpo_status,vpo_date,request_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
// const getRequestByControlNo = "SELECT * FROM cash_advance_request WHERE controlNo = ?"
const getRequestByControlNo = "SELECT ca.id AS id, ca.idNumber AS idNumber, ca.author AS author, ca.jobTitle AS jobTitle, ca.branch AS branch, ca.area AS area,ca.region AS region, ca.email AS email, ca.purpose AS purpose, ca.controlNo AS controlNo, ca.date AS `date`, ca.travelDate AS travelDate,ca.departureDate AS departureDate, ca.arrivalDate AS arrivalDate, ca.amount AS amount, ca.area_approver AS area_approver, ca.am_status AS am_status,ca.am_date AS am_date,ca.regional_approver AS regional_approver, ca.rm_status AS rm_status,ca.rm_date AS rm_date, ca.ram_approver AS ram_approver, ca.ram_status AS ram_status,ca.ram_date AS ram_date, ca.ass_vpo_approver AS ass_vpo_approver,ca.ass_status AS ass_status,ca.ass_date AS ass_date, ca.vpo_approver AS vpo_approver, ca.vpo_status AS vpo_status,ca.vpo_date AS vpo_date, ca.request_status AS request_status,am.fullname AS am_fullname, rm.fullname AS rm_fullname, ram.fullname AS ram_fullname, ass.fullname AS ass_fullname, vpo.fullname AS vpo_fullname FROM `branch_request`.`cash_advance_request` ca INNER JOIN `branch_request`.`am_approvers` am ON am.email = ca.area_approver INNER JOIN rm_approvers rm ON rm.email = ca.regional_approver INNER JOIN ram_approvers ram ON ram.email = ca.ram_approver INNER JOIN ass_vpo_approvers ass ON ass.email = ca.ass_vpo_approver INNER JOIN vpo_approver vpo ON vpo.email = ca.vpo_approver WHERE controlNo = ?"
const getMaxId = "SELECT id FROM cash_advance_request WHERE id = (SELECT MAX(id) FROM cash_advance_request)";
const deleteRequest = "DELETE FROM cash_advance_request WHERE controlNo = ?";

const updateRequestStatus = "UPDATE cash_advance_request SET request_status = ? WHERE controlNo = ?";

//RF REQUEST
const getRfMaxId = "SELECT id FROM revolving_fund_request WHERE id = (SELECT MAX(id) FROM revolving_fund_request)";
const postRfRequest = "INSERT INTO revolving_fund_request (type,rfDate, requestor,baseBranch, region,email,period,controlNo,rfAllowance,pendingRf,totalExpenses,cashOnHand,transportation,officeSupplies,meals,others,total,purpose,am_approver,am_status,am_date,rm_approver,rm_status,rm_date,ram_approver,ram_status,ram_date,ass_vpo_approver,ass_status,ass_date,vpo_approver,vpo_status,vpo_date,request_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
const getRfRequestByControlNo = "SELECT rf.id AS id, rf.type AS type, rf.rfDate AS rf_date, rf.requestor AS requestor, rf.baseBranch AS baseBranch, rf.region AS region,rf.email AS email,rf.period AS period, rf.controlNo AS controlNo, rf.rfAllowance AS allowance, rf.pendingRf AS pendingRf, rf.totalExpenses AS totalExpenses, rf.cashOnHand AS cashOnHand,rf.transportation AS transportation, rf.officeSupplies AS officeSupplies, rf.meals AS meals, rf.others AS others, rf.total AS total, rf.purpose AS purpose, rf.am_approver AS am_approver, rf.am_status AS am_status, rf.am_date AS am_date, rf.rm_approver AS rm_approver, rf.rm_status AS rm_status, rf.rm_date AS rm_date, rf.ram_approver AS ram_approver, rf.ram_status AS ram_status, rf.ram_date AS ram_date, rf.ass_vpo_approver AS ass_vpo_approver,rf.ass_status AS ass_status, rf.ass_date AS ass_date, rf.vpo_approver AS vpo_approver, rf.vpo_status AS vpo_status, rf.vpo_date AS vpo_date, rf.request_status AS request_status, (CASE WHEN (rf.am_approver = NULL) THEN NULL ELSE (SELECT fullname FROM am_approvers WHERE email = rf.am_approver) END ) AS am_fullname, (CASE WHEN (rf.rm_approver = NULL) THEN NULL ELSE (SELECT fullname FROM rm_approvers WHERE email = rf.rm_approver) END ) AS rm_fullname, (CASE WHEN (rf.ram_approver = NULL) THEN NULL ELSE (SELECT fullname FROM ram_approvers WHERE email = rf.ram_approver) END ) AS ram_fullname, (CASE WHEN (rf.ass_vpo_approver = NULL) THEN NULL ELSE (SELECT fullname FROM ass_vpo_approvers WHERE email = rf.ass_vpo_approver) END ) AS ass_fullname,(CASE WHEN (rf.vpo_approver = NULL) THEN NULL ELSE(SELECT fullname FROM vpo_approver WHERE email = rf.vpo_approver)END) AS vpo_fullname FROM revolving_fund_request rf LEFT JOIN am_approvers am ON am.email = rf.am_approver LEFT JOIN rm_approvers rm ON rm.email = rf.rm_approver LEFT JOIN ram_approvers ram ON ram.email = rf.ram_approver LEFT JOIN ass_vpo_approvers ass ON ass.email = rf.ass_vpo_approver LEFT JOIN vpo_approver vpo ON vpo.email = rf.vpo_approver WHERE controlNo = ?";
const updateRfRequestStatus = "UPDATE revolving_fund_request SET request_status = ? WHERE controlNo = ?";
// const getAreaCode = "SELECT areacode AS areaname FROM branches WHERE branchname LIKE %?%";


module.exports = {
    getUserById,
    getUserByEmail,
    getByBranchCodeZoneCode,
    getRequestByControlNo,
    postRequest,
    getMaxId,
    deleteRequest,
    getRfMaxId,
    postRfRequest,
    getRfRequestByControlNo,
    updateRequestStatus,
    updateRfRequestStatus
    // getAreaCode
}