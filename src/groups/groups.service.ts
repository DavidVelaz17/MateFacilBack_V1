import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
  ) {}

  create(createGroupDto: any) {
    const newGroup = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(newGroup);
  }

  findAll() {
    return this.groupRepository.find();
  }

  findOne(id_grupo: number) {
    return this.groupRepository.findOneBy({ id_grupo });
  }

  async update(id_grupo: number, updateGroupDto: any) {
    await this.groupRepository.update(id_grupo, updateGroupDto);
    return this.findOne(id_grupo);
  }

  remove(id: number) {
    return this.groupRepository.delete(id);
  }
}
