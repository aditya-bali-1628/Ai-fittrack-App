import { useEffect, useState } from "react"
import { getMotivationalMessage } from "../assets/assets"
import { useAppContext } from "../context/AppContext"
import type { FoodEntry, ActivityEntry } from "../types";
import Card from "../assets/ui/Card";
import ProgressBar from "../assets/ui/ProgressBar";
import { FlameIcon, HamburgerIcon, ActivityIcon, ZapIcon, TrendingUpDown, ScaleIcon, RulerIcon } from "lucide-react";
import CaloriesChart from "../assets/CaloriesChart";

const Dashboard = () => {
  const { user, allActivityLogs, allFoodLogs } = useAppContext()
  const [todayFood, setTodayFood] = useState<FoodEntry[]>([])
  const [todayActivity, setTodayActivity] = useState<ActivityEntry[]>([])

  const DAILY_CALORIES_LIMIT: number = user?.dailyCalorieIntake || 2000;

  //load user data

  const loadUserData = () => {
    const today = new Date().toISOString().split('T')[0];
    const foodData = allFoodLogs.filter((f: FoodEntry) => f.createdAt?.split('T')[0] === today)
    setTodayFood(foodData)
    const activityData = allActivityLogs.filter((f: ActivityEntry) => f.createdAt?.split('T')[0] === today)
    setTodayActivity(activityData)
  }

  useEffect(() => {
    (() => { loadUserData() })();
  }, [allActivityLogs, allFoodLogs])

  const totalCalories: number = todayFood.reduce((sum, item) => sum + item.calories, 0)

  const remainingCalories: number = DAILY_CALORIES_LIMIT - totalCalories;

  const totalActivityMinutes: number = todayActivity.reduce((sum, item) => sum + item.duration, 0)

  const totalBurned: number = todayActivity.reduce((sum, item) => sum + (item.calories || 0), 0)
  const motivation = getMotivationalMessage(totalCalories, totalActivityMinutes, DAILY_CALORIES_LIMIT)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
      <div className=" bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 pt-12 pb-20 rounded-b-3xl">
        <p>Welcom Back</p>
        <h1>{`Hi there!  ${user?.username}`}</h1>
        <div className="mt-6 bg-white/20 backdrop:backdrop-blur-sm rounded-2xl p-4 ">
          <div className="flex item-center gap-3">
            <span className="text-3xl">{motivation.emoji}</span>
            <p className="text-white font-medium">{motivation.text}</p>
          </div>
        </div>
      </div>
      { /*  Main Content  */}
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
        { /* calories card */}
        <Card className="shadow-lg col-span-2">
          <div className="flex items-center justify-between mb-4">

            {/* LEFT SIDE (icon + text together) */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center"> <HamburgerIcon className="w-6 h-6 text-orange-500" /></div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Calories Consumed</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{totalCalories}</p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Limit</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{DAILY_CALORIES_LIMIT}</p>
            </div>

          </div>

          <ProgressBar value={totalCalories} max={DAILY_CALORIES_LIMIT} />
          <div className="mt-4 flex justify-between items-center">
            <div
              className={`px-3 py-1.5 rounded-lg ${remainingCalories >= 0
                ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'
                }`}
            >
              <span className="text-sm font-medium">
                {remainingCalories >= 0 ? `${remainingCalories} kacal remaining` : `${Math.abs(remainingCalories)} kcal over`}
              </span>
            </div>
            <span>{Math.round((totalCalories / DAILY_CALORIES_LIMIT) * 100)}%</span>
          </div>

          <div className="border-t border-s-teal-100 dark:border-slate-800 my-4"></div>
          <div className="flex items-center justify-between mb-4">
            {/* LEFT SIDE (icon + text together) */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center"> <FlameIcon className="w-6 h-6 text-orange-500" /></div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Calories Burned</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{totalBurned}</p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{user?.dailyCalorieBurn || 400}</p>
            </div>
          </div>
          <ProgressBar value={totalBurned} max={user?.dailyCalorieBurn || 400} />
        </Card>
        {/* state row */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {/* Activity Minutes*/}
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-slate-500">Activity</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalActivityMinutes}</p>
            <p className="text-sm text-slate-400">Minutes today</p>
          </Card>
          {/* Activity counts*/}
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ZapIcon className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-slate-500">Workouts</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{todayActivity.length}</p>
            <p className="text-sm text-slate-400">activites logged</p>
          </Card>
        </div>
        {/* Goal card*/}
        {user && (
          <Card className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                <TrendingUpDown className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>

              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Your Goal
                </p>

                <p className="text-slate-900 dark:text-white font-semibold capitalize">
                  {user.goal === 'lose' && 'Lose Weight'}
                  {user.goal === 'maintain' && 'Maintain Weight'}
                  {user.goal === 'gain' && 'Gain Muscle'}
                </p>
              </div>

            </div>
          </Card>
        )}

        {/*  Body Metrics Card*/}
        {user && user.weight && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl  flex items-center justify-center bg-indigo-100" >
                <ScaleIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Body Metrics</h3>
                <p className="text-slate-500 text-sm">Your stats</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center ">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <ScaleIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Weight</span>
                </div>
                <span className="font-semibold text-slate-700 dark: text-slate-200">{user.weight} kg</span>

              </div>

              {user.height && (
                <div className="flex justify-between items-center ">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <RulerIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Height</span>
                  </div>
                  <span className="font-semibold text-slate-700 dark:ktext-slate-200">{user.height} cm</span>

                </div>

              )}


              {user.height && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >BMI</span>
                    {(() => {
                      const bmi = (user.weight / Math.pow(user.height / 100, 2)).toFixed(1);
                      const getStatus = (b: number) => {
                        if (b < 18.5) return {
                          color: 'text-blue-500',
                          bg: 'bg-blue-500'
                        }
                        if (b < 25) return {
                          color: 'text-emerald-500',
                          bg: 'bg-emerald-500'
                        };
                        if (b < 30) return {
                          color: 'text-orange-500',
                          bg: 'bg-orange-500'
                        };

                        return {
                          color: 'text-red-500',
                          bg: 'bg-red-500'
                        }

                      }
                      const status = getStatus(Number(bmi));
                      return <span className={`text-lg font-bold ${status.color}`}>{bmi}</span>
                    })()}
                  </div>
                  {/*BMI sacale visual */}
                  <div className="h-2 w-full bg-slate-100  dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-blue-400 opacity-30"></div>
                    <div className="flex-1 bg-emerald-400 opacity-30"></div>
                    <div>
                      <div className="flex-1 bg-orange-400 opacity-30"></div>
                    </div>

                    <div>
                      <div className="flex-1 bg-red-400 opacity-30"></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>

                    </div>
                  </div>

                </div>
              )}
            </div>
          </Card>
        )}

        { /* quick summury */}
        <Card>
          <h3 className="font-semibold text-slate-800 dark:text-white"> Today's Summury</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Meals Logged</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{todayFood.length}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Total Calories</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{totalCalories} kcal</span>
            </div>

            <div className="flex justify-between items-center py-2 ">
              <span className="text-slate-500 dark:text-slate-400">Active time</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{totalActivityMinutes} min</span>
            </div>

          </div>
        </Card>

        {/* Activity & intake graph */}
        <Card className="col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2"> This Week's progress</h3>
          <CaloriesChart />
        </Card>
      </div>
    </div>
  )
}

export default Dashboard