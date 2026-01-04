export default function WorkersPage() {
    return (
      <>
        <h2>Workers</h2>
        <p>Manage factory workers and system access</p>
  
        <table
          border="1"
          cellPadding="10"
          style={{
            marginTop: "20px",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead style={{ backgroundColor: "#f3f4f6" }}>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
  
          <tbody>
            <tr>
              <td>worker1@factory.com</td>
              <td>WORKER</td>
              <td>Active</td>
              <td>View Jobs</td>
            </tr>
  
            <tr>
              <td>worker2@factory.com</td>
              <td>WORKER</td>
              <td>Active</td>
              <td>View Jobs</td>
            </tr>
  
            <tr>
              <td>admin@factory.com</td>
              <td>ADMIN</td>
              <td>Active</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </>
    );
  }
  