const workerJobStatusFlow = {
    RECEIVED: ["GRINDING"],
    GRINDING: ["SANDBLASTING"],
    SANDBLASTING: ["COATING"],
    COATING: ["BONDING"],
    BONDING: ["FINISHING"],
    FINISHING: ["INSPECTION"],
    INSPECTION: ["DISPATCHED"],
  };
  
  export default workerJobStatusFlow;
  