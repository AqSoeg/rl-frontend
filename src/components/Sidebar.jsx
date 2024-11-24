import { Input, Select } from 'antd'

const { Option } = Select

const Sidebar = () => {
  return (
    <div className='p-6 flex flex-col gap-4 bg-white'>
      <h2 className='text-xl font-bold'>智能体编辑</h2>
      <div>
        <label className='block text-sm font-semibold mb-1'>想定场景</label>
        <Select placeholder='请选择' className='w-full'>
          <Option value='1'>场景1</Option>
          <Option value='2'>场景2</Option>
        </Select>
      </div>

      <div>
        <label className='block text-sm font-semibold mb-1'>
          智能体角色/功能
        </label>
        <Select placeholder='请选择' className='w-full'>
          <Option value='1'>角色1</Option>
          <Option value='2'>角色2</Option>
        </Select>
      </div>

      <div>
        <label className='block text-sm font-semibold mb-1'>智能体类型</label>
        <Input placeholder='请输入类型' />
      </div>

      <div>
        <label className='block text-sm font-semibold mb-1'>智能体名称</label>
        <Input placeholder='请输入名称' />
      </div>

      <div>
        <label className='block text-sm font-semibold mb-1'>版本</label>
        <Input placeholder='请输入版本' />
      </div>

      <div>
        <p>模型名称：XXX</p>
        <p>模型ID：XXX</p>
      </div>

      <div>
        <label className='block text-sm font-semibold mb-1'>智能体数量</label>
        <Input placeholder='请输入数量' />
      </div>

      <div>
        <label className='block text-sm font-semibold mb-1'>智能体</label>
        <Select placeholder='请选择' className='w-full'>
          <Option value='1'>智能体1</Option>
          <Option value='2'>智能体2</Option>
        </Select>
      </div>
    </div>
  )
}

export default Sidebar
