import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "@/api/settings";
import BottomAction from "@/components/BottomAction";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import TopBar from "@/components/TopBar";
import { AGE_MAX, AGE_MIN, GUARDIAN_TYPES } from "@/constants/onboarding";

const AGES = Array.from(
  { length: AGE_MAX - AGE_MIN + 1 },
  (_, i) => AGE_MIN + i,
);

// 입력 필드와 같은 모양의 선택 상자
const SELECT_CLASS =
  "h-14.5 w-full appearance-none rounded-button border border-border-neutral bg-white px-5.5 text-center text-body font-medium text-ink outline-none focus:border-yellow";

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-4">
      <span className="text-body-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

// F03 개인정보 관리 — 이름·나이·보호자 유형 표시 및 저장하기
function ProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    getProfile().then((p) => {
      if (!ignore) setForm(p);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...form, name: form.name.trim() });
      navigate("/settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TopBar title="프로필" />
      {form && (
        <main className="flex flex-col gap-12.5 px-5 pt-12.75">
          <Field label="이름">
            <TextField
              value={form.name}
              maxLength={20}
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>
          <Field label="나이">
            <select
              value={form.age}
              onChange={(e) => set({ age: Number(e.target.value) })}
              className={SELECT_CLASS}
            >
              {AGES.map((a) => (
                <option key={a} value={a}>
                  {a}세
                </option>
              ))}
            </select>
          </Field>
          <Field label="보호자 유형">
            <select
              value={form.guardianType}
              onChange={(e) => set({ guardianType: e.target.value })}
              className={SELECT_CLASS}
            >
              {GUARDIAN_TYPES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
        </main>
      )}
      <BottomAction>
        <Button disabled={!form?.name.trim() || saving} onClick={handleSave}>
          저장하기
        </Button>
      </BottomAction>
    </>
  );
}

export default ProfilePage;
