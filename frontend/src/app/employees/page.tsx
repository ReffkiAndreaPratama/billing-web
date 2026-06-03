"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { Users, Clock, Plus } from "lucide-react";
export default function EmployeesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"list" | "attendance">("list");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    position: "KASIR",
    salary: 0,
  });
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);
  const loadData = async () => {
    try {
      const [emp, att] = await Promise.all([
        api.employees.list(user?.branchId),
        api.employees.attendance(
          user?.branchId ? `branchId=${user.branchId}` : undefined,
        ),
      ]);
      setEmployees(Array.isArray(emp) ? emp : []);
      setAttendance(Array.isArray(att) ? att : []);
    } catch {}
  };
  const createEmployee = async () => {
    try {
      await api.employees.create({ ...form, branchId: user?.branchId });
      setShowCreate(false);
      setForm({ name: "", phone: "", email: "", position: "KASIR", salary: 0 });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const doClockIn = async (employeeId: string) => {
    try {
      await api.employees.clockIn(employeeId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const doClockOut = async (id: string) => {
    try {
      await api.employees.clockOut(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {" "}
            <Users className="w-6 h-6 text-foreground" /> Employees{" "}
          </h1>{" "}
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Employee
          </Button>{" "}
        </div>{" "}
        <div className="flex gap-2">
          {" "}
          <Button
            variant={tab === "list" ? "default" : "outline"}
            onClick={() => setTab("list")}
          >
            Employee List
          </Button>{" "}
          <Button
            variant={tab === "attendance" ? "default" : "outline"}
            onClick={() => setTab("attendance")}
          >
            Attendance
          </Button>{" "}
        </div>{" "}
        {showCreate && (
          <Card className="border-[#4d96ff]/30">
            {" "}
            <CardHeader>
              <CardTitle className="text-base">New Employee</CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-3">
              {" "}
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />{" "}
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />{" "}
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />{" "}
              <select
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              >
                {" "}
                <option value="KASIR">Kasir</option>{" "}
                <option value="ADMIN">Admin</option>{" "}
                <option value="TEKNISI">Teknisi</option>{" "}
                <option value="CLEANING">Cleaning</option>{" "}
              </select>{" "}
              <Input
                type="number"
                placeholder="Salary"
                value={form.salary}
                onChange={(e) =>
                  setForm({ ...form, salary: Number(e.target.value) })
                }
              />{" "}
              <div className="flex gap-2">
                {" "}
                <Button onClick={createEmployee}>Save</Button>{" "}
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        )}{" "}
        {tab === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {" "}
            {employees.map((emp) => (
              <Card key={emp.id}>
                {" "}
                <CardContent className="p-4">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <div>
                      {" "}
                      <div className="font-bold text-foreground">
                        {emp.name}
                      </div>{" "}
                      <div className="text-xs text-muted-foreground">
                        {emp.position}
                      </div>{" "}
                    </div>{" "}
                    <Badge variant={emp.isActive ? "success" : "danger"}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>{" "}
                  </div>{" "}
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {" "}
                    <p>Phone: {emp.phone}</p>{" "}
                    <p>Salary: Rp {emp.salary?.toLocaleString() || "-"}</p>{" "}
                    <p>Hired: {formatDate(emp.hireDate)}</p>{" "}
                  </div>{" "}
                  <div className="flex gap-2 mt-3">
                    {" "}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => doClockIn(emp.id)}
                    >
                      Clock In
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => doClockOut(emp.id)}
                    >
                      Clock Out
                    </Button>{" "}
                  </div>{" "}
                </CardContent>{" "}
              </Card>
            ))}{" "}
          </div>
        )}{" "}
        {tab === "attendance" && (
          <Card>
            {" "}
            <CardHeader>
              <CardTitle className="text-base">Attendance Log</CardTitle>
            </CardHeader>{" "}
            <CardContent>
              {" "}
              <div className="space-y-2">
                {" "}
                {attendance.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    {" "}
                    <div>
                      {" "}
                      <div className="text-sm text-foreground">
                        {a.employee?.name}
                      </div>{" "}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(a.clockIn)}
                      </div>{" "}
                    </div>{" "}
                    <div className="text-right">
                      {" "}
                      <div className="text-sm">
                        {a.clockOut ? (
                          formatDate(a.clockOut)
                        ) : (
                          <Badge variant="warning">Active</Badge>
                        )}
                      </div>{" "}
                      <div className="text-xs text-muted-foreground">
                        {a.hoursWorked ? `${a.hoursWorked}h` : "-"}
                      </div>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        )}{" "}
      </main>{" "}
    </div>
  );
}
