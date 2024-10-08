import "../ServerList.css";
import { useState, useEffect } from "react";
import { API_URL } from "../main";

type ServerData = {
  id: string;
  server_name: string;
  status: string;
  flavor_name: string;
  ip_address: string;
  os_name: string;
};

const ServerList = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [serverList, setServerList] = useState<ServerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  useEffect(() => {
    console.log("Fetching server list...");
    fetch(`${API_URL}/api/server/list`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Data fetched:", data);
        setServerList(data.server_list);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching server list:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>サーバーリスト ({serverList.length}台)</h2>
      <table>
        <thead>
          <tr>
            <th>状態</th>
            <th>名前</th>
            {!isMobile && (
              <>
                <th>IPアドレス</th>
                <th>スペック</th>
              </>
            )}
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {serverList.map((server, index) => (
            <tr key={index}>
              <td>
                <div className="status">
                  <div className={server.status === "ACTIVE" ? "green" : "red"}></div>
                  {!isMobile && server.status}
                </div>
              </td>
              <td>{server.server_name}</td>
              {!isMobile && (
                <>
                  <td>{server.ip_address}</td>
                  <td>
                    {server.flavor_name.replace(/.*-.*-c(\d+)m(\d+)/, "CPU $1core/メモリ $2GB ")}
                    <span className={server.os_name?.includes("win") ? "tag windows" : "tag vps"}>
                      {server.os_name?.includes("win") ? "Windows" : server.os_name.replace(/^[^-]*-(.*)-[^-]*$/, "$1")}
                    </span>
                  </td>
                </>
              )}
              <td className="control">
                {server.status === "ACTIVE" ? (
                  <button className="button" onClick={() => handleStop(server.id)}>停止</button>
                ) : (
                  <button className="button" onClick={() => handleStart(server.id)}>再開</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const handleStop = (serverId: string) => {
  fetch(`${API_URL}/api/server/operation/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      server_id: serverId,
    }),
  })
};

const handleStart = (serverId: string) => {
  fetch(`${API_URL}/api/server/operation/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      server_id: serverId,
    }),
  })
};

export default ServerList;
