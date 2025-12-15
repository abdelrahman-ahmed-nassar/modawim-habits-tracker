import { useEffect, useState, FormEvent } from "react";
import { toast } from "react-toastify";
import { AuthService } from "../services/auth";
import Input from "../components/ui/Input";
import { LogOut } from "lucide-react";
import Button from "../components/ui/Button";

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await AuthService.me();
        setName(me.name || "");
        setEmail(me.email);
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error("فشل تحميل الملف الشخصي");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    setSavingName(true);
    try {
      const updated = await AuthService.updateProfile(name.trim());
      setName(updated.name);
      toast.success("تم تحديث الاسم بنجاح");
    } catch (err) {
      console.error("Failed to update name", err);
      toast.error("فشل تحديث الاسم");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("كلمات المرور الجديدة غير متطابقة");
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error("الرجاء إدخال كلمة المرور الحالية والجديدة");
      return;
    }
    setChangingPassword(true);
    try {
      await AuthService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("تم تحديث كلمة المرور");
    } catch (err) {
      console.error("Failed to change password", err);
      toast.error("فشل تحديث كلمة المرور");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "هل أنت متأكد من رغبتك في حذف حسابك؟ سيتم حذف جميع العادات والملاحظات المرتبطة بالحساب ولا يمكن التراجع."
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await AuthService.deleteAccount();
      toast.success("تم حذف الحساب");
      window.location.href = "/register";
    } catch (err) {
      console.error("Failed to delete account", err);
      toast.error("فشل حذف الحساب");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            الملف الشخصي
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            تحديث بياناتك الشخصية وكلمة المرور
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form
          onSubmit={handleSaveName}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            المعلومات الأساسية
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              الاسم
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              البريد الإلكتروني
            </label>
            <Input type="email" value={email} disabled />
          </div>
          <Button type="submit" disabled={savingName}>
            {savingName ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            تغيير كلمة المرور
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              كلمة المرور الحالية
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              كلمة المرور الجديدة
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              تأكيد كلمة المرور الجديدة
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={changingPassword}>
            {changingPassword ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
          </Button>
        </form>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          حذف الحساب
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          سيؤدي هذا إلى حذف حسابك وجميع عاداتك وملاحظاتك نهائيًا.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {deleting ? "جارٍ الحذف..." : "حذف الحساب"}
        </Button>
      </div>
    </div>
  );
};

export default Profile;

