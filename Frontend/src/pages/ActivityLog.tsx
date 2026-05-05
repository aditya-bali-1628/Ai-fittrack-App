
import { useAppContext } from "../context/AppContext"
import {  useEffect, useState } from "react";
import type { ActivityEntry } from "../types";
import Card from "../assets/ui/Card";
import { quickActivities } from "../assets/assets";
import { ActivityIcon, DumbbellIcon, PlusIcon, TimerIcon, TrashIcon } from "lucide-react"
import Input from "../assets/ui/Input";
import Button from "../assets/ui/Button";
import toast from "react-hot-toast";

import api from "../configs/api";

const ActivityLog = () => {

  const { allActivityLogs, setAllActivityLogs } = useAppContext();

  const [activies, setActivies] = useState<ActivityEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormdata] = useState({ name: '', duration: 0, calories: 0 })
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const loadActivity = () => {
    const todayActivities = allActivityLogs.filter((a: ActivityEntry) => a.createdAt?.
      split('T')[0] === today)
    setActivies(todayActivities)
  }

  useEffect(() => {
    (() => {
      loadActivity()

    })();

  }, [allActivityLogs])

  const totalMinutes: number = activies.reduce((sum, a) => sum + a.duration, 0)

  const handleQucikAdd = (activity: { name: string, rate: number }) => {
    setFormdata({
      name: activity.name,
      duration: 30,
      calories: 30 * activity.rate

    })
    setShowForm(true)
  }

  const handleDurationChange = (val: string | number) => {
    const duration = Number(val);
    const activity = quickActivities.find(a => a.name === formData.name)

    let calories = formData.calories
    if (activity) {
      calories = duration * activity.rate
    }
    setFormdata({ ...formData, duration, calories })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.duration <= 0) {
      return toast('Please enter valid data')
    }
    try {
     const {data} = await api.post('/api/activity-logs', {data: formData})
      setAllActivityLogs(prev => [...prev, data])
      setFormdata({ name: '', duration: 0, calories: 0 })
      setShowForm(false)
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message);
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      const confirm = window.confirm('Are you sure want to delete this entry ?')
      if (!confirm) return;
      await api.delete(`/api/activity-logs/${documentId}`)
      setAllActivityLogs(prev => prev.filter((e) => e.documentId !== documentId))
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message);
    }
  }
  return (


    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* Header*/}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 bg-white dark:bg-slate-900  ">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Activity Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track your work outs
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active Today
          </p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {totalMinutes} min
          </p>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* quick add section */}
        {!showForm && (

          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Quick Add
              </h3>

              <div className="flex flex-wrap gap-2">
                {quickActivities.map((activity) => (
                  <button
                    key={activity.name}
                    onClick={() => handleQucikAdd(activity)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 
        dark:hover:bg-slate-700 rounded-xl text-sm font-medium 
        text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {activity.emoji} {activity.name}
                  </button>
                ))}
              </div>
            </Card>

            <Button
              className="w-full"
              onClick={() => setShowForm(true)}>
              <PlusIcon className="size-5" />
              Add Custom Activity
            </Button>
          </div>
        )}


        {/* Add From */}
        {
          showForm && (
            <Card className="border-2 border-blue-200 dark:border-blue-800">

              <h3 className="font-semibold text-slate-800 dark:text-white mb-4"> New Activity</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>

                <Input label="Activity Name" placeholder="e.g., Morning Run" required value={formData.name} onChange={(v) => setFormdata({ ...formData, name: v.toString() })} />
                <div className="flex gap-4">
                  <Input
                    min={1}
                    max={300}
                    label="Duration (min)"
                    className="flex-1"
                    type="number"
                    placeholder="30"
                    required
                    value={formData.duration}
                    onChange={handleDurationChange}
                  />

                  <Input
                    min={1}
                    max={2000}
                    label="Duration (min)"
                    className="flex-1"
                    type="number"
                    placeholder="200"
                    required
                    value={formData.calories}
                    onChange={(v) => setFormdata({ ...formData, calories: Number(v) })}
                  />
                </div>

                {/* Error */}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type='button' variant='secondary' className="flex-1"
                    onClick={() => {
                      setShowForm(false); setError('');
                      setFormdata({ name: '', duration: 0, calories: 0 })
                    }}>
                    Cancel </Button>

                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl"
                  >
                    Add Activity
                  </Button>
                </div>
              </form>
            </Card>
          )
        }

        {/* Activity List */}
        {activies.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <DumbbellIcon className="w-8 h-8 text-slate-400 dark:text-teal-500" />
            </div>

            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
              No activities logged today
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Start and track your progress
            </p>
          </Card>
        ) : (
          <Card>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ActivityIcon className="size-5 text-blue-600" />
                </div>

                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Today's Activities
                </h3>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activies.length} logged
              </p>
            </div>

            {/* LIST */}
            <div className="space-y-2">
              {activies.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <TimerIcon className="size-5 text-blue-500 dark:text-blue-400" />
                    </div>

                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {activity.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(activity?.createdAt || "").toLocaleTimeString(
                          "en-us",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{activity.duration} min</p>
                      <p className="text-xs  text-slate-400">{activity.calories} kcal</p>
                    </div>
                    <button onClick={() => handleDelete(activity.documentId)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/*  total summary*/}
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Total Active Time</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalMinutes} minutes</span>
            </div>

          </Card>
        )}

      </div>
    </div>
  )
}

export default ActivityLog