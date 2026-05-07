import { useAppContext } from "../context/AppContext"
import type { FoodEntry, FormData } from "../types"
import { useEffect, useState, useRef } from "react"
import Card from "../assets/ui/Card"
import Button from "../assets/ui/Button"
import { mealColors, mealIcons, mealTypeOptions, quickActivitiesFoodLog } from "../assets/assets"
import { Loader2Icon, PlusIcon, SparkleIcon, Trash2Icon, UtensilsCrossedIcon } from "lucide-react"
import Input from "../assets/ui/Input"
import Select from "../assets/ui/Select"
import toast from "react-hot-toast"
import api from "../configs/api"
import AICalorieEstimator from "../components/ai/AICalorieEstimator" // ← NEW

const FoodLog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext()

  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [showForm, seShowtForm] = useState(false)
  const [showEstimator, setShowEstimator] = useState(false) // ← NEW
  const [formData, setFormdata] = useState<FormData>({
    name: "",
    calories: 0,
    mealType: ""
  });

  const [loading, setLoading] = useState(false)
  const inputref = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0];

  const loadEntries = () => {
    const todayEntries = allFoodLogs.filter((e: FoodEntry) => e.createdAt?.split('T')[0] === today)
    setEntries(todayEntries)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.calories || formData.calories <= 0 || !formData.mealType) {
      return toast.error('please enter valid data')
    }
    try {
      const { data } = await api.post('/api/food-logs', { data: formData })
      setAllFoodLogs(prev => [...prev, data])
      setFormdata({ name: '', calories: 0, mealType: '' })
      seShowtForm(false)
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message);
    }
  }

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  const groupEntries: Record<'breakfast' | 'lunch' | 'dinner' | 'snack', FoodEntry[]> = entries.reduce((acc, entry) => {
    if (!acc[entry.mealType]) acc[entry.mealType] = [];
    acc[entry.mealType].push(entry);
    return acc;
  }, {} as Record<'breakfast' | 'lunch' | 'dinner' | 'snack', FoodEntry[]>)

  const handleQucikAdd = (activityName: string) => {
    setFormdata({ ...formData, mealType: activityName })
    seShowtForm(true)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true)
    const formData = new FormData();
    formData.append('image', file)
    try {
      const { data } = await api.post('/api/image-analysis', formData)
      const result = data.result;
      let mealType = '';

      const hour = new Date().getHours()
      if (hour >= 0 && hour < 12) mealType = 'breakfast'
      else if (hour >= 12 && hour < 16) mealType = 'lunch';
      else if (hour >= 16 && hour < 18) mealType = 'snack'
      else if (hour >= 18 && hour < 24) mealType = 'dinner'

      if (!mealType || !result.name || !result.calories) {
        return toast.error('Missing data')
      }

      const { data: newEntry } = await api.post('/api/food-logs', { data: { name: result.name, calories: result.calories, mealType } })
      setAllFoodLogs(prev => [...prev, newEntry])

      if (inputref.current) inputref.current.value = ''
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message);
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      const confirm = window.confirm('Are you sure want to delete this entry ?')
      if (!confirm) return;
      await api.delete(`/api/food-logs/${documentId}`)
      setAllFoodLogs(prev => prev.filter((e) => e.documentId !== documentId))
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message);
    }
  }

  // ← NEW: callback from AICalorieEstimator — fills the form
  const handleUseEstimate = (name: string, calories: number) => {
    const hour = new Date().getHours();
    let mealType = '';
    if (hour >= 0 && hour < 12) mealType = 'breakfast';
    else if (hour >= 12 && hour < 16) mealType = 'lunch';
    else if (hour >= 16 && hour < 18) mealType = 'snack';
    else mealType = 'dinner';

    setFormdata({ name, calories, mealType });
    setShowEstimator(false);
    seShowtForm(true);
    toast.success(`Filled: ${name} — ${calories} kcal`);
  };

  useEffect(() => {
    (() => { loadEntries(); })();
  }, [allFoodLogs])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 bg-white dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Food Log</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily intake</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">Today's Total</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalCalories} kcal</p>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:grid lg:grid-cols-2 lg:gap-6">
        {!showForm && !showEstimator && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Quick Add</h3>
              <div className="flex flex-wrap gap-2">
                {quickActivitiesFoodLog.map((activity) => (
                  <button
                    onClick={() => handleQucikAdd(activity.name)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 
                    dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    key={activity.name}>
                    {activity.emoji} {activity.name}
                  </button>
                ))}
              </div>
            </Card>

            <Button className="w-full" onClick={() => seShowtForm(true)}>
              <PlusIcon className="size-5" />
              Add Food Entry
            </Button>

            {/* ─── AI ESTIMATOR BUTTON (NEW) ─── */}
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 border-purple-500"
              onClick={() => setShowEstimator(true)}
            >
              <SparkleIcon className="size-5" />
              AI Calorie Estimator
            </Button>

            <Button className="w-full" onClick={() => { inputref.current?.click() }}>
              <SparkleIcon className="size-5" />
              AI Food Snap
            </Button>
            <input type="file" onChange={handleImageChange} accept="image/**" hidden ref={inputref} />
            {loading && (
              <div className="fixed inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop:-blur flex items-center justify-center z-100">
                <Loader2Icon className="size-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* ─── AI CALORIE ESTIMATOR PANEL (NEW) ─── */}
        {showEstimator && (
          <div className="space-y-3">
            <AICalorieEstimator onUseEstimate={handleUseEstimate} />
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowEstimator(false)}
            >
              Cancel
            </Button>
          </div>
        )}

        {showForm && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4"> New Food Entry</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Food Name" value={formData.name} onChange={(v) => setFormdata({ ...formData, name: v.toString() })}
                placeholder="e.g.,Grilled Chicken Salad" required />

              <Input label="Calories" type="number" value={formData.calories} onChange={(v) => setFormdata({ ...formData, calories: Number(v) })}
                placeholder="e.g.,350" required min={1} />

              <Select label="Meal Type" value={formData.mealType} onChange={(v) => setFormdata({ ...formData, mealType: v.toString() })}
                options={mealTypeOptions} placeholder="Select meal type" required />

              <div className="flex gap-3 pt-2">
                <Button className="flex-1" type="button" variant="secondary"
                  onClick={() => { seShowtForm(false); setFormdata({ name: '', calories: 0, mealType: '' }) }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Entry
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-start mx-auto mb-4">
              <UtensilsCrossedIcon className="size-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">No food logged today</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Start tracking your meals to stay on target</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
              const mealTypekey = mealType as keyof typeof groupEntries;
              if (!groupEntries[mealTypekey]) return null;

              const MealIcon = mealIcons[mealTypekey];
              const mealCalories = groupEntries[mealTypekey].reduce((sum, e) => sum + e.calories, 0);
              return (
                <Card key={mealType}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mealColors[mealTypekey]}`}>
                        <MealIcon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white capitalize">{mealType}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{groupEntries[mealTypekey].length} items</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sla dark:text-slate-200">{mealCalories}</p>
                  </div>

                  <div className="space-y-2">
                    {groupEntries[mealTypekey].map((entry) => (
                      <div key={entry.id} className="food-entry-item flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 dark:text-slate-200">{entry.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{entry.mealType}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{entry.calories} kcal</span>
                          <button
                            onClick={() => handleDelete(entry?.documentId || "")}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodLog
