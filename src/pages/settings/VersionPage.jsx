import { useEffect, useState } from "react";
import { getVersion } from "@/api/settings";
import TopBar from "@/components/TopBar";

// F08 버전 정보 — 서비스 로고·앱 버전
function VersionPage() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    let ignore = false;
    getVersion().then((v) => {
      if (!ignore) setVersion(v.version);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <TopBar title="버전 정보" />
      <main className="flex flex-col items-center pt-61.75 text-center">
        <h1 className="font-logo text-[56px] leading-[1.2] text-yellow">
          생각의힘
        </h1>
        <p className="mt-7.75 text-body font-medium text-muted">
          앱 버전 {version}
        </p>
      </main>
    </>
  );
}

export default VersionPage;
