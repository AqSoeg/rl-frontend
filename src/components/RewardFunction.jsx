import { Button } from 'antd'

const RewardFunction = () => {
  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-xl font-bold mb-4'>奖励函数</h2>
      <div className='flex flex-col gap-2'>
        {[...Array(6)].map((_, index) => (
          <Button key={index} block>
            奖励函数{index + 1}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default RewardFunction
