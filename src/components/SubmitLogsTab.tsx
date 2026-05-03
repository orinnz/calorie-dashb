import { useState } from 'react'
import { dailyRecordsApi } from '../api/dailyRecords'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { getApiErrorMessage } from '../api/errors'

export function SubmitLogsTab() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Food log form state
  const [foodForm, setFoodForm] = useState({
    name: '',
    descriptionText: '',
    calories: 0,
    protein: 0,
  })
  const [isFoodLoading, setIsFoodLoading] = useState(false)

  // Water log form state
  const [waterAmount, setWaterAmount] = useState(250)
  const [isWaterLoading, setIsWaterLoading] = useState(false)

  const handleAddFoodLog = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!foodForm.name.trim()) {
      toast.error('Vui lòng nhập tên món ăn')
      return
    }

    if (foodForm.calories <= 0) {
      toast.error('Calories phải lớn hơn 0')
      return
    }

    setIsFoodLoading(true)
    try {
      await dailyRecordsApi.addFoodLog(selectedDate, {
        name: foodForm.name,
        descriptionText: foodForm.descriptionText,
        calories: foodForm.calories,
        protein: foodForm.protein,
      })
      toast.success('Đã thêm log món ăn')
      setFoodForm({
        name: '',
        descriptionText: '',
        calories: 0,
        protein: 0,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thêm log món ăn'))
    } finally {
      setIsFoodLoading(false)
    }
  }

  const handleAddWaterLog = async (e: React.FormEvent) => {
    e.preventDefault()

    if (waterAmount <= 0) {
      toast.error('Lượng nước phải lớn hơn 0')
      return
    }

    setIsWaterLoading(true)
    try {
      await dailyRecordsApi.addWaterLog(selectedDate, waterAmount)
      toast.success(`Đã thêm ${waterAmount}ml nước`)
      setWaterAmount(250)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thêm log nước'))
    } finally {
      setIsWaterLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chọn ngày
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Đang ghi log cho ngày: <span className="font-mono font-semibold">{selectedDate}</span>
        </p>
      </div>

      {/* Food Log Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Plus className="w-5 h-5 inline-block mr-2" />
          Thêm log món ăn
        </h3>
        <form onSubmit={handleAddFoodLog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên món ăn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
              placeholder="e.g., Bát Phở Bò Khổng Lồ"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isFoodLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              value={foodForm.descriptionText}
              onChange={(e) =>
                setFoodForm({ ...foodForm, descriptionText: e.target.value })
              }
              placeholder="e.g., Nhiều thịt ít bánh"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isFoodLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Calories <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={foodForm.calories}
                onChange={(e) =>
                  setFoodForm({
                    ...foodForm,
                    calories: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 600"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isFoodLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={foodForm.protein}
                onChange={(e) =>
                  setFoodForm({
                    ...foodForm,
                    protein: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isFoodLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isFoodLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isFoodLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Thêm log món ăn
          </button>
        </form>
      </div>

      {/* Water Log Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Plus className="w-5 h-5 inline-block mr-2" />
          Thêm log nước
        </h3>
        <form onSubmit={handleAddWaterLog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lượng nước (ml) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={waterAmount}
              onChange={(e) => setWaterAmount(parseInt(e.target.value) || 0)}
              placeholder="e.g., 250"
              min="1"
              step="50"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isWaterLoading}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setWaterAmount(amount)}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
                disabled={isWaterLoading}
              >
                {amount}ml
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isWaterLoading}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isWaterLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Thêm log nước
          </button>
        </form>
      </div>
    </div>
  )
}
