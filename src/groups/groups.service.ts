import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
  ) {}

  create(createGroupDto: CreateGroupDto) {
    const newGroup = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(newGroup);
  }

  findAll() {
    return this.groupRepository.find();
  }

  findAllByTeacher(id_docente: number) {
    return this.groupRepository.find({
      where: {
        docente: { id_docente: id_docente },
      },
    });
  }

  findOne(id_grupo: number) {
    return this.groupRepository.findOneBy({ id_grupo });
  }

  async update(id_grupo: number, updateGroupDto: UpdateGroupDto) {
    const existing = await this.findOne(id_grupo);
    if (!existing) {
      throw new NotFoundException(`Grupo con ID ${id_grupo} no encontrado`);
    }
    await this.groupRepository.update(id_grupo, updateGroupDto);
    return this.findOne(id_grupo);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return this.groupRepository.delete(id);
  }
}
